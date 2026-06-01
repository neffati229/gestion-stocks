package com.gestionstocks.repository;

import com.gestionstocks.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    List<Categorie> findAllByOrderByNom();
}
