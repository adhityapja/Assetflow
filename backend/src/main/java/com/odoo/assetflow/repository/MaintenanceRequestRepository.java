package com.odoo.assetflow.repository;

import com.odoo.assetflow.model.MaintenanceRequest;
import com.odoo.assetflow.dto.ChartDataDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.odoo.assetflow.model.enums.MaintenanceStatus;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    long countByStatus(MaintenanceStatus status);

    @Query("SELECT new com.odoo.assetflow.dto.ChartDataDTO(CAST(m.status AS string), COUNT(m)) FROM MaintenanceRequest m GROUP BY m.status")
    List<ChartDataDTO> countMaintenanceByStatus();

    @Query("SELECT new com.odoo.assetflow.dto.ChartDataDTO(m.asset.category, COUNT(m)) FROM MaintenanceRequest m GROUP BY m.asset.category")
    List<ChartDataDTO> countMaintenanceByCategory();
}
