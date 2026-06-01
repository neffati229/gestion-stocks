package com.gestionstocks.service;

import com.gestionstocks.dto.AuthDto;
import com.gestionstocks.entity.Utilisateur;
import com.gestionstocks.repository.UtilisateurRepository;
import com.gestionstocks.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Utilisateur user = (Utilisateur) auth.getPrincipal();

        // Mise à jour last_login
        user.setLastLogin(LocalDateTime.now());
        utilisateurRepository.save(user);

        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return new AuthDto.LoginResponse(
                accessToken, refreshToken,
                user.getUsername(), user.getNom(), user.getPrenom(),
                user.getRole().name(),
                user.getMagasin() != null ? user.getMagasin().getId() : null
        );
    }

    public AuthDto.LoginResponse refresh(AuthDto.RefreshRequest request) {
        String username = jwtUtil.extractUsername(request.getRefreshToken());
        Utilisateur user = utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!jwtUtil.isTokenValid(request.getRefreshToken(), user)) {
            throw new RuntimeException("Refresh token invalide");
        }

        String newAccessToken = jwtUtil.generateToken(user);
        return new AuthDto.LoginResponse(
                newAccessToken, request.getRefreshToken(),
                user.getUsername(), user.getNom(), user.getPrenom(),
                user.getRole().name(),
                user.getMagasin() != null ? user.getMagasin().getId() : null
        );
    }
}
