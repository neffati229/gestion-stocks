package com.gestionstocks.service;

import com.gestionstocks.repository.MouvementStockRepository;
import com.gestionstocks.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RapportService {

    private final StockRepository stockRepository;
    private final MouvementStockRepository mouvementRepository;

    public Map<String, Object> getDashboardStats(Long magasinId) {
        Map<String, Object> stats = new HashMap<>();

        var stocks = stockRepository.findByMagasinId(magasinId);

        BigDecimal valeurAchat = stocks.stream()
                .map(s -> s.getQuantite().multiply(s.getProduit().getPrixAchat()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal valeurVente = stocks.stream()
                .map(s -> s.getQuantite().multiply(s.getProduit().getPrixVente()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long nbSousSeuilMin = stocks.stream()
                .filter(s -> s.getQuantite().intValue() <= s.getProduit().getSeuilMin())
                .count();

        stats.put("valeurAchat", valeurAchat);
        stats.put("valeurVente", valeurVente);
        stats.put("nbReferences", stocks.size());
        stats.put("nbSousSeuilMin", nbSousSeuilMin);
        return stats;
    }

    public List<Map<String, Object>> getTopProduits(Long magasinId, int limit,
                                                     LocalDateTime debut, LocalDateTime fin) {
        List<Object[]> rows = mouvementRepository.findTopProduitsSorties(debut, fin);
        return rows.stream().limit(limit).map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("nom", row[0]);
            m.put("totalSorties", row[1]);
            return m;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCommandesProposees(Long magasinId) {
        return stockRepository.findByMagasinId(magasinId).stream()
                .filter(s -> s.getQuantite().intValue() <= s.getProduit().getSeuilMin())
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("produitId", s.getProduit().getId());
                    m.put("code", s.getProduit().getCode());
                    m.put("nom", s.getProduit().getNom());
                    m.put("quantiteActuelle", s.getQuantite());
                    m.put("seuilMin", s.getProduit().getSeuilMin());
                    m.put("quantiteACommander", s.getProduit().getSeuilMax() - s.getQuantite().intValue());
                    m.put("prixUnitaire", s.getProduit().getPrixAchat());
                    BigDecimal total = s.getProduit().getPrixAchat()
                            .multiply(new BigDecimal(s.getProduit().getSeuilMax() - s.getQuantite().intValue()));
                    m.put("totalCommande", total);
                    if (s.getProduit().getFournisseur() != null) {
                        m.put("fournisseurId", s.getProduit().getFournisseur().getId());
                        m.put("fournisseurNom", s.getProduit().getFournisseur().getNom());
                    }
                    return m;
                }).collect(Collectors.toList());
    }
}
