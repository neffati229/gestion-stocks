package com.gestionstocks.controller;

import com.gestionstocks.entity.Magasin;
import com.gestionstocks.entity.Categorie;
import com.gestionstocks.entity.Fournisseur;
import com.gestionstocks.repository.MagasinRepository;
import com.gestionstocks.repository.CategorieRepository;
import com.gestionstocks.repository.FournisseurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReferenceController {

    private final MagasinRepository magasinRepository;
    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;

    // --- Magasins ---
    @GetMapping("/magasins")
    public ResponseEntity<List<Magasin>> getMagasins() {
        return ResponseEntity.ok(magasinRepository.findByActifTrue());
    }

    @PostMapping("/magasins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Magasin> createMagasin(@RequestBody Magasin magasin) {
        return ResponseEntity.ok(magasinRepository.save(magasin));
    }

    // --- Catégories ---
    @GetMapping("/categories")
    public ResponseEntity<List<Categorie>> getCategories() {
        return ResponseEntity.ok(categorieRepository.findAllByOrderByNom());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Categorie> createCategorie(@RequestBody Categorie categorie) {
        return ResponseEntity.ok(categorieRepository.save(categorie));
    }

    // --- Fournisseurs ---
    @GetMapping("/fournisseurs")
    public ResponseEntity<List<Fournisseur>> getFournisseurs() {
        return ResponseEntity.ok(fournisseurRepository.findByActifTrueOrderByNom());
    }

    @PostMapping("/fournisseurs")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Fournisseur> createFournisseur(@RequestBody Fournisseur fournisseur) {
        return ResponseEntity.ok(fournisseurRepository.save(fournisseur));
    }
}
