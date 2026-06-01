package com.gestionstocks.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockDto {

    @Data
    public static class Response {
        private Long id;
        private Long produitId;
        private String produitCode;
        private String produitNom;
        private Long magasinId;
        private String magasinNom;
        private BigDecimal quantite;
        private int seuilMin;
        private int seuilMax;
        private boolean sousSeuilMin;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class MouvementRequest {
        @NotNull private Long produitId;
        @NotNull private Long magasinId;

        @NotBlank private String type; // ENTREE, SORTIE, TRANSFERT, AJUSTEMENT

        @NotNull @DecimalMin(value = "0.01", message = "La quantité doit être positive")
        private BigDecimal quantite;

        private BigDecimal prixUnitaire;
        private String reference;
        private String commentaire;

        // Pour transfert
        private Long magasinDestId;
    }

    @Data
    public static class MouvementResponse {
        private Long id;
        private Long produitId;
        private String produitNom;
        private String produitCode;
        private Long magasinId;
        private String magasinNom;
        private String typeMvt;
        private BigDecimal quantite;
        private BigDecimal prixUnitaire;
        private String reference;
        private String commentaire;
        private String utilisateurNom;
        private LocalDateTime createdAt;
    }
}
