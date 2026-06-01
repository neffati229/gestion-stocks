package com.gestionstocks.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fournisseurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(length = 100)
    private String contact;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telephone;

    @Column(length = 255)
    private String adresse;

    @Column(name = "delai_livraison")
    @Builder.Default
    private int delaiLivraison = 7;

    @Builder.Default
    private boolean actif = true;
}
