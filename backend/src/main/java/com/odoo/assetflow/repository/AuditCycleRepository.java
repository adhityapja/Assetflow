package com.odoo.assetflow.repository;

import com.odoo.assetflow.model.AuditCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditCycleRepository extends JpaRepository<AuditCycle, Long> {
}
