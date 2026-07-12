package com.odoo.assetflow.dto;

import com.odoo.assetflow.model.Asset;
import java.util.List;

public record ReportDTO(
    List<ChartDataDTO> assetsByCategory,
    List<ChartDataDTO> assetsByStatus,
    List<ChartDataDTO> maintenanceByStatus,
    
    // New fields
    List<ChartDataDTO> departmentAllocation,
    List<ChartDataDTO> mostUsedAssets,
    List<ChartDataDTO> maintenanceByCategory,
    List<Asset> upcomingMaintenance,
    List<BookingHeatmapDTO> bookingHeatmap
) {}
