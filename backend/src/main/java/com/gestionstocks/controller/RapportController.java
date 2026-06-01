package com.gestionstocks.controller;

import com.gestionstocks.service.RapportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rapports")
@RequiredArgsConstructor
public class RapportController {

    private final RapportService rapportService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestParam Long magasinId) {
        return ResponseEntity.ok(rapportService.getDashboardStats(magasinId));
    }

    @GetMapping("/top-produits")
    public ResponseEntity<List<Map<String, Object>>> getTopProduits(
            @RequestParam Long magasinId,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(rapportService.getTopProduits(magasinId, limit, debut, fin));
    }

    @GetMapping("/commandes-proposees")
    public ResponseEntity<List<Map<String, Object>>> getCommandesProposees(@RequestParam Long magasinId) {
        return ResponseEntity.ok(rapportService.getCommandesProposees(magasinId));
    }
}
