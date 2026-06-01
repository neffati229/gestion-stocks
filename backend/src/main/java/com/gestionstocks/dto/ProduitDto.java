package com.gestionstocks.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProduitDto {

    @Data
    public static class Request {
        @NotBlank(message = "Le code est requis")
        @Size(max = 50)
        private String code;

        @NotBlank(message = "Le nom est requis")
        @Size(max = 150)
        private String nom;

        private String description;

        private Long categorieId;
        private Long fournisseurId;

        private String uniteMesure = "UNITE";

        @NotNull @DecimalMin("0.0")
        private BigDecimal prixAchat;

        @NotNull @DecimalMin("0.0")
        private BigDecimal prixVente;

        @Min(0) private int seuilMin = 10;
        @Min(0) private int seuilMax = 1000;

        private LocalDate dateExpiration;
    }

    @Data
    public static class Response {
        private Long id;
        private String code;
        private String nom;
        private String description;
        private Long categorieId;
        private String categorieNom;
        private Long fournisseurId;
        private String fournisseurNom;
        private String uniteMesure;
        private BigDecimal prixAchat;
        private BigDecimal prixVente;
        private BigDecimal margeBeneficiaire;
        private int seuilMin;
        private int seuilMax;
        private LocalDate dateExpiration;
        private boolean actif;
    }
}
