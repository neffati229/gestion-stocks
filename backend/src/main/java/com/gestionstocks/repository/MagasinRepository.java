package com.gestionstocks.repository;

import com.gestionstocks.entity.Magasin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MagasinRepository extends JpaRepository<Magasin, Long> {
    List<Magasin> findByActifTrue();
}
