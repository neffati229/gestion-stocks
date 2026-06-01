package com.gestionstocks.repository;

import com.gestionstocks.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByProduitIdAndMagasinId(Long produitId, Long magasinId);

    List<Stock> findByMagasinId(Long magasinId);

    @Query("SELECT s FROM Stock s JOIN FETCH s.produit p JOIN FETCH s.magasin m " +
           "WHERE m.id = :magasinId ORDER BY p.nom")
    List<Stock> findByMagasinIdWithDetails(@Param("magasinId") Long magasinId);
}
