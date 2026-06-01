package com.gestionstocks.controller;

import com.gestionstocks.dto.ProduitDto;
import com.gestionstocks.service.ProduitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitService produitService;

    @GetMapping
    public ResponseEntity<List<ProduitDto.Response>> findAll() {
        return ResponseEntity.ok(produitService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduitDto.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.findById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProduitDto.Response>> search(@RequestParam String q) {
        return ResponseEntity.ok(produitService.search(q));
    }

    @GetMapping("/alertes")
    public ResponseEntity<List<ProduitDto.Response>> getSousSeuilMin(@RequestParam Long magasinId) {
        return ResponseEntity.ok(produitService.findSousSeuilMin(magasinId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<ProduitDto.Response> create(@Valid @RequestBody ProduitDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produitService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<ProduitDto.Response> update(@PathVariable Long id,
                                                       @Valid @RequestBody ProduitDto.Request request) {
        return ResponseEntity.ok(produitService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
