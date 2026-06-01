package com.gestionstocks.repository;

import com.gestionstocks.entity.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {
    List<Fournisseur> findByActifTrueOrderByNom();
}
