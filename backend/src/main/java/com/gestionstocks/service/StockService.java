package com.gestionstocks.service;

import com.gestionstocks.dto.StockDto;
import com.gestionstocks.entity.*;
import com.gestionstocks.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final ProduitRepository produitRepository;
    private final MagasinRepository magasinRepository;
    private final MouvementStockRepository mouvementRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<StockDto.Response> getStockParMagasin(Long magasinId) {
        return stockRepository.findByMagasinIdWithDetails(magasinId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getQuantiteDisponible(Long produitId, Long magasinId) {
        return stockRepository.findByProduitIdAndMagasinId(produitId, magasinId)
                .map(Stock::getQuantite)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public void entreeStock(StockDto.MouvementRequest request) {
        if (request.getQuantite().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("La quantité doit être positive");
        }
        Produit produit = getProduit(request.getProduitId());
        Magasin magasin = getMagasin(request.getMagasinId());
        Utilisateur utilisateur = getCurrentUser();

        updateQuantiteStock(produit, magasin, request.getQuantite());
        saveMouvement(produit, magasin, MouvementStock.TypeMouvement.ENTREE,
                request.getQuantite(), request.getPrixUnitaire(),
                request.getReference(), request.getCommentaire(), utilisateur);
    }

    @Transactional
    public void sortieStock(StockDto.MouvementRequest request) {
        BigDecimal stockActuel = getQuantiteDisponible(request.getProduitId(), request.getMagasinId());
        if (stockActuel.compareTo(request.getQuantite()) < 0) {
            throw new IllegalStateException("Stock insuffisant. Disponible: " + stockActuel);
        }
        Produit produit = getProduit(request.getProduitId());
        Magasin magasin = getMagasin(request.getMagasinId());
        Utilisateur utilisateur = getCurrentUser();

        updateQuantiteStock(produit, magasin, request.getQuantite().negate());
        saveMouvement(produit, magasin, MouvementStock.TypeMouvement.SORTIE,
                request.getQuantite(), null,
                request.getReference(), request.getCommentaire(), utilisateur);
    }

    @Transactional
    public void transfertStock(StockDto.MouvementRequest request) {
        BigDecimal stockActuel = getQuantiteDisponible(request.getProduitId(), request.getMagasinId());
        if (stockActuel.compareTo(request.getQuantite()) < 0) {
            throw new IllegalStateException("Stock insuffisant pour le transfert. Disponible: " + stockActuel);
        }
        Produit produit = getProduit(request.getProduitId());
        Magasin magasinSource = getMagasin(request.getMagasinId());
        Magasin magasinDest = getMagasin(request.getMagasinDestId());
        Utilisateur utilisateur = getCurrentUser();

        String ref = "TRANSFERT-" + System.currentTimeMillis();

        updateQuantiteStock(produit, magasinSource, request.getQuantite().negate());
        updateQuantiteStock(produit, magasinDest, request.getQuantite());

        saveMouvement(produit, magasinSource, MouvementStock.TypeMouvement.TRANSFERT,
                request.getQuantite(), null, ref, request.getCommentaire(), utilisateur);
        saveMouvement(produit, magasinDest, MouvementStock.TypeMouvement.ENTREE,
                request.getQuantite(), null, ref, request.getCommentaire(), utilisateur);
    }

    @Transactional
    public void ajustementStock(StockDto.MouvementRequest request) {
        Produit produit = getProduit(request.getProduitId());
        Magasin magasin = getMagasin(request.getMagasinId());
        Utilisateur utilisateur = getCurrentUser();

        Stock stock = stockRepository.findByProduitIdAndMagasinId(produit.getId(), magasin.getId())
                .orElse(Stock.builder().produit(produit).magasin(magasin).quantite(BigDecimal.ZERO).build());

        BigDecimal delta = request.getQuantite().subtract(stock.getQuantite());
        stock.setQuantite(request.getQuantite());
        stockRepository.save(stock);

        saveMouvement(produit, magasin, MouvementStock.TypeMouvement.AJUSTEMENT,
                delta.abs(), null, request.getReference(), request.getCommentaire(), utilisateur);
    }

    public List<StockDto.MouvementResponse> getMouvements(Long magasinId) {
        return mouvementRepository.findByMagasinIdOrderByCreatedAtDesc(magasinId).stream()
                .map(this::toMouvementResponse)
                .collect(Collectors.toList());
    }

    // -------- Helpers --------

    private void updateQuantiteStock(Produit produit, Magasin magasin, BigDecimal delta) {
        Stock stock = stockRepository.findByProduitIdAndMagasinId(produit.getId(), magasin.getId())
                .orElse(Stock.builder().produit(produit).magasin(magasin).quantite(BigDecimal.ZERO).build());
        stock.setQuantite(stock.getQuantite().add(delta));
        if (stock.getQuantite().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Le stock ne peut pas être négatif");
        }
        stockRepository.save(stock);
    }

    private void saveMouvement(Produit produit, Magasin magasin, MouvementStock.TypeMouvement type,
                                BigDecimal quantite, BigDecimal prixUnitaire,
                                String reference, String commentaire, Utilisateur utilisateur) {
        MouvementStock mvt = MouvementStock.builder()
                .produit(produit).magasin(magasin).typeMvt(type)
                .quantite(quantite).prixUnitaire(prixUnitaire)
                .reference(reference).commentaire(commentaire)
                .utilisateur(utilisateur)
                .build();
        mouvementRepository.save(mvt);
    }

    private Produit getProduit(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + id));
    }

    private Magasin getMagasin(Long id) {
        return magasinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Magasin non trouvé: " + id));
    }

    private Utilisateur getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByUsername(username).orElse(null);
    }

    public StockDto.Response toResponse(Stock s) {
        StockDto.Response r = new StockDto.Response();
        r.setId(s.getId());
        r.setProduitId(s.getProduit().getId());
        r.setProduitCode(s.getProduit().getCode());
        r.setProduitNom(s.getProduit().getNom());
        r.setMagasinId(s.getMagasin().getId());
        r.setMagasinNom(s.getMagasin().getNom());
        r.setQuantite(s.getQuantite());
        r.setSeuilMin(s.getProduit().getSeuilMin());
        r.setSeuilMax(s.getProduit().getSeuilMax());
        r.setSousSeuilMin(s.getQuantite().intValue() <= s.getProduit().getSeuilMin());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }

    public StockDto.MouvementResponse toMouvementResponse(MouvementStock m) {
        StockDto.MouvementResponse r = new StockDto.MouvementResponse();
        r.setId(m.getId());
        r.setProduitId(m.getProduit().getId());
        r.setProduitNom(m.getProduit().getNom());
        r.setProduitCode(m.getProduit().getCode());
        r.setMagasinId(m.getMagasin().getId());
        r.setMagasinNom(m.getMagasin().getNom());
        r.setTypeMvt(m.getTypeMvt().name());
        r.setQuantite(m.getQuantite());
        r.setPrixUnitaire(m.getPrixUnitaire());
        r.setReference(m.getReference());
        r.setCommentaire(m.getCommentaire());
        r.setCreatedAt(m.getCreatedAt());
        if (m.getUtilisateur() != null) {
            r.setUtilisateurNom(m.getUtilisateur().getNom() + " " + m.getUtilisateur().getPrenom());
        }
        return r;
    }
}
