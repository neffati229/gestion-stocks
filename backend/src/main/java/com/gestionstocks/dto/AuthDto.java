package com.gestionstocks.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Le nom d'utilisateur est requis")
        private String username;

        @NotBlank(message = "Le mot de passe est requis")
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private String username;
        private String nom;
        private String prenom;
        private String role;
        private Long magasinId;

        public LoginResponse(String accessToken, String refreshToken,
                             String username, String nom, String prenom,
                             String role, Long magasinId) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.username = username;
            this.nom = nom;
            this.prenom = prenom;
            this.role = role;
            this.magasinId = magasinId;
        }
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }
}
