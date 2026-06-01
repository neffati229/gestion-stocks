package com.gestionstocks.service;

import com.gestionstocks.dto.UtilisateurDto;
import com.gestionstocks.entity.Utilisateur;
import com.gestionstocks.repository.MagasinRepository;
import com.gestionstocks.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final MagasinRepository magasinRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UtilisateurDto.Response> findAll() {
        return utilisateurRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UtilisateurDto.Response create(UtilisateurDto.CreateRequest request) {
        if (utilisateurRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Nom d'utilisateur déjà utilisé");
        }
        if (request.getEmail() != null && utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        Utilisateur user = Utilisateur.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .role(Utilisateur.Role.valueOf(request.getRole()))
                .actif(true)
                .build();

        if (request.getMagasinId() != null) {
            magasinRepository.findById(request.getMagasinId()).ifPresent(user::setMagasin);
        }
        return toResponse(utilisateurRepository.save(user));
    }

    @Transactional
    public void toggleActif(Long id) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setActif(!user.isActif());
        utilisateurRepository.save(user);
    }

    @Transactional
    public void updatePassword(Long id, UtilisateurDto.UpdatePasswordRequest request) {
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getPassword())) {
            throw new IllegalArgumentException("Ancien mot de passe incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(user);
    }

    public UtilisateurDto.Response toResponse(Utilisateur u) {
        UtilisateurDto.Response r = new UtilisateurDto.Response();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setNom(u.getNom());
        r.setPrenom(u.getPrenom());
        r.setEmail(u.getEmail());
        r.setRole(u.getRole().name());
        r.setActif(u.isActif());
        if (u.getMagasin() != null) {
            r.setMagasinId(u.getMagasin().getId());
            r.setMagasinNom(u.getMagasin().getNom());
        }
        return r;
    }
}
