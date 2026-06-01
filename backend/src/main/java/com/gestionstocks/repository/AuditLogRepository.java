package com.gestionstocks.repository;

import com.gestionstocks.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUtilisateurIdOrderByCreatedAtDesc(Long utilisateurId, Pageable pageable);
    List<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
