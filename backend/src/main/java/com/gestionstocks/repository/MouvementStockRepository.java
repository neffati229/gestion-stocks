package com.gestionstocks.repository;

import com.gestionstocks.entity.MouvementStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {

    List<MouvementStock> findByProduitIdOrderByCreatedAtDesc(Long produitId);

    List<MouvementStock> findByMagasinIdOrderByCreatedAtDesc(Long magasinId);

    @Query("SELECT m FROM MouvementStock m WHERE m.magasin.id = :magasinId " +
           "AND m.createdAt BETWEEN :debut AND :fin ORDER BY m.createdAt DESC")
    List<MouvementStock> findByMagasinAndPeriode(
            @Param("magasinId") Long magasinId,
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin);

    @Query("SELECT m.produit.nom, SUM(m.quantite) as total " +
           "FROM MouvementStock m WHERE m.typeMvt = 'SORTIE' " +
           "AND m.createdAt BETWEEN :debut AND :fin " +
           "GROUP BY m.produit.id, m.produit.nom ORDER BY total DESC")
    List<Object[]> findTopProduitsSorties(
            @Param("debut") LocalDateTime debut,
            @Param("fin") LocalDateTime fin);
}
