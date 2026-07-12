package com.odoo.assetflow.repository;

import com.odoo.assetflow.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.odoo.assetflow.dto.ChartDataDTO;
import com.odoo.assetflow.model.enums.AssetStatus;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    long countByStatus(AssetStatus status);

    @Query("SELECT new com.odoo.assetflow.dto.ChartDataDTO(a.category, COUNT(a)) FROM Asset a GROUP BY a.category")
    List<ChartDataDTO> countAssetsByCategory();

    @Query("SELECT new com.odoo.assetflow.dto.ChartDataDTO(CAST(a.status AS string), COUNT(a)) FROM Asset a GROUP BY a.status")
    List<ChartDataDTO> countAssetsByStatus();

    // Department allocation
    @Query("SELECT new com.odoo.assetflow.dto.ChartDataDTO(d.name, COUNT(a)) FROM Asset a, User u, Department d WHERE a.assignedUserId = u.id AND u.departmentId = d.id GROUP BY d.name")
    List<ChartDataDTO> countAssetsByDepartment();

    // Upcoming maintenance (mocked here as assets not available but let's assume we fetch all assets and filter, or just return ones that need maintenance, e.g. status is UNDER_MAINTENANCE or we just pick some)
    // The requirement is "Assets due for maintenance or nearing retirement". Since we don't have a "next maintenance date" field in Asset, we'll return recently added assets or just any assets with a specific status. Let's add a simple query.
    @Query("SELECT a FROM Asset a WHERE a.status = 'UNDER_MAINTENANCE' OR a.status = 'RETIRED'")
    List<Asset> findAssetsNeedingAttention();
}
