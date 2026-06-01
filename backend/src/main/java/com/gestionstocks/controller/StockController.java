package com.gestionstocks.controller;

import com.gestionstocks.dto.StockDto;
import com.gestionstocks.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<List<StockDto.Response>> getStock(@RequestParam Long magasinId) {
        return ResponseEntity.ok(stockService.getStockParMagasin(magasinId));
    }

    @GetMapping("/mouvements")
    public ResponseEntity<List<StockDto.MouvementResponse>> getMouvements(@RequestParam Long magasinId) {
        return ResponseEntity.ok(stockService.getMouvements(magasinId));
    }

    @PostMapping("/entree")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Void> entree(@Valid @RequestBody StockDto.MouvementRequest request) {
        stockService.entreeStock(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sortie")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE', 'VENDEUR')")
    public ResponseEntity<Void> sortie(@Valid @RequestBody StockDto.MouvementRequest request) {
        stockService.sortieStock(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transfert")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<Void> transfert(@Valid @RequestBody StockDto.MouvementRequest request) {
        stockService.transfertStock(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/ajustement")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> ajustement(@Valid @RequestBody StockDto.MouvementRequest request) {
        stockService.ajustementStock(request);
        return ResponseEntity.ok().build();
    }
}
