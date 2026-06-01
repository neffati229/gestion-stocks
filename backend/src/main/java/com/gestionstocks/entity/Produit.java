package com.gestionstocks.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Entity
@Table(name = "produits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @Enumerated(EnumType.STRING)
    @Column(name = "unite_mesure")
    @Builder.Default
    private UniteMesure uniteMesure = UniteMesure.UNITE;

    @Column(name = "prix_achat", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal prixAchat = BigDecimal.ZERO;

    @Column(name = "prix_vente", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal prixVente = BigDecimal.ZERO;

    @Column(name = "seuil_min")
    @Builder.Default
    private int seuilMin = 10;

    @Column(name = "seuil_max")
    @Builder.Default
    private int seuilMax = 1000;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Builder.Default
    private boolean actif = true;

    public enum UniteMesure {
        UNITE, KG, LITRE, METRE
    }

    @Transient
    public BigDecimal getMargeBeneficiaire() {
        if (prixAchat.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return prixVente.subtract(prixAchat)
                .divide(prixAchat, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }
}
