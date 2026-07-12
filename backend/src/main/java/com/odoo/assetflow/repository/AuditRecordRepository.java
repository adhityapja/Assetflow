package com.odoo.assetflow.repository;

import com.odoo.assetflow.model.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditRecordRepository extends JpaRepository<AuditRecord, Long> {
    List<AuditRecord> findByAuditCycleId(Long auditCycleId);
}
