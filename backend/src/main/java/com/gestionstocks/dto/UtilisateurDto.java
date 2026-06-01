package com.gestionstocks.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

public class UtilisateurDto {

    @Data
    public static class CreateRequest {
        @NotBlank @Size(min = 3, max = 50)
        private String username;

        @NotBlank @Size(min = 6)
        private String password;

        @Size(max = 100) private String nom;
        @Size(max = 100) private String prenom;

        @Email @Size(max = 100) private String email;

        @NotBlank private String role; // ADMIN, GESTIONNAIRE, VENDEUR

        private Long magasinId;
    }

    @Data
    public static class Response {
        private Long id;
        private String username;
        private String nom;
        private String prenom;
        private String email;
        private String role;
        private Long magasinId;
        private String magasinNom;
        private boolean actif;
    }

    @Data
    public static class UpdatePasswordRequest {
        @NotBlank private String ancienMotDePasse;
        @NotBlank @Size(min = 6) private String nouveauMotDePasse;
    }
}
