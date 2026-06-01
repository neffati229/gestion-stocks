package com.gestionstocks.repository;

import com.gestionstocks.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByActifTrueOrderByNom();

    Optional<Produit> findByCodeAndActifTrue(String code);

    boolean existsByCode(String code);

    @Query("SELECT p FROM Produit p JOIN Stock s ON s.produit = p " +
           "WHERE s.magasin.id = :magasinId AND s.quantite <= p.seuilMin AND p.actif = true")
    List<Produit> findProduitsSousSeuilMin(@Param("magasinId") Long magasinId);

    @Query("SELECT p FROM Produit p WHERE p.actif = true AND " +
           "(LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Produit> searchByNomOrCode(@Param("search") String search);
}
