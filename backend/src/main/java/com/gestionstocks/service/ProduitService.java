package com.gestionstocks.service;

import com.gestionstocks.dto.ProduitDto;
import com.gestionstocks.entity.Categorie;
import com.gestionstocks.entity.Fournisseur;
import com.gestionstocks.entity.Produit;
import com.gestionstocks.repository.CategorieRepository;
import com.gestionstocks.repository.FournisseurRepository;
import com.gestionstocks.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;

    public List<ProduitDto.Response> findAll() {
        return produitRepository.findByActifTrueOrderByNom().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProduitDto.Response findById(Long id) {
        return produitRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + id));
    }

    public List<ProduitDto.Response> search(String query) {
        return produitRepository.searchByNomOrCode(query).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProduitDto.Response> findSousSeuilMin(Long magasinId) {
        return produitRepository.findProduitsSousSeuilMin(magasinId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProduitDto.Response create(ProduitDto.Request request) {
        if (produitRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Code produit déjà utilisé: " + request.getCode());
        }
        Produit produit = toEntity(request);
        return toResponse(produitRepository.save(produit));
    }

    @Transactional
    public ProduitDto.Response update(Long id, ProduitDto.Request request) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + id));

        produit.setNom(request.getNom());
        produit.setDescription(request.getDescription());
        produit.setPrixAchat(request.getPrixAchat());
        produit.setPrixVente(request.getPrixVente());
        produit.setSeuilMin(request.getSeuilMin());
        produit.setSeuilMax(request.getSeuilMax());
        produit.setDateExpiration(request.getDateExpiration());
        produit.setUniteMesure(Produit.UniteMesure.valueOf(request.getUniteMesure()));

        if (request.getCategorieId() != null) {
            produit.setCategorie(categorieRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée")));
        }
        if (request.getFournisseurId() != null) {
            produit.setFournisseur(fournisseurRepository.findById(request.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé")));
        }
        return toResponse(produitRepository.save(produit));
    }

    @Transactional
    public void delete(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + id));
        produit.setActif(false); // Soft delete
        produitRepository.save(produit);
    }

    private Produit toEntity(ProduitDto.Request req) {
        Produit p = new Produit();
        p.setCode(req.getCode());
        p.setNom(req.getNom());
        p.setDescription(req.getDescription());
        p.setPrixAchat(req.getPrixAchat());
        p.setPrixVente(req.getPrixVente());
        p.setSeuilMin(req.getSeuilMin());
        p.setSeuilMax(req.getSeuilMax());
        p.setDateExpiration(req.getDateExpiration());
        p.setUniteMesure(Produit.UniteMesure.valueOf(req.getUniteMesure()));
        p.setActif(true);

        if (req.getCategorieId() != null) {
            categorieRepository.findById(req.getCategorieId()).ifPresent(p::setCategorie);
        }
        if (req.getFournisseurId() != null) {
            fournisseurRepository.findById(req.getFournisseurId()).ifPresent(p::setFournisseur);
        }
        return p;
    }

    public ProduitDto.Response toResponse(Produit p) {
        ProduitDto.Response r = new ProduitDto.Response();
        r.setId(p.getId());
        r.setCode(p.getCode());
        r.setNom(p.getNom());
        r.setDescription(p.getDescription());
        r.setPrixAchat(p.getPrixAchat());
        r.setPrixVente(p.getPrixVente());
        r.setMargeBeneficiaire(p.getMargeBeneficiaire());
        r.setSeuilMin(p.getSeuilMin());
        r.setSeuilMax(p.getSeuilMax());
        r.setDateExpiration(p.getDateExpiration());
        r.setActif(p.isActif());
        r.setUniteMesure(p.getUniteMesure().name());
        if (p.getCategorie() != null) {
            r.setCategorieId(p.getCategorie().getId());
            r.setCategorieNom(p.getCategorie().getNom());
        }
        if (p.getFournisseur() != null) {
            r.setFournisseurId(p.getFournisseur().getId());
            r.setFournisseurNom(p.getFournisseur().getNom());
        }
        return r;
    }
}
