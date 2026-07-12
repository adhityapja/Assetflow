package com.odoo.assetflow.service;

import com.odoo.assetflow.dto.DashboardMetrics;
import com.odoo.assetflow.model.enums.AssetStatus;
import com.odoo.assetflow.model.enums.BookingStatus;
import com.odoo.assetflow.model.enums.MaintenanceStatus;
import com.odoo.assetflow.repository.AssetRepository;
import com.odoo.assetflow.repository.BookingRepository;
import com.odoo.assetflow.repository.MaintenanceRequestRepository;
import org.springframework.stereotype.Service;

@Service
public class MetricsService {

    private final AssetRepository assetRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRequestRepository maintenanceRepository;

    public MetricsService(AssetRepository assetRepository,
                          BookingRepository bookingRepository,
                          MaintenanceRequestRepository maintenanceRepository) {
        this.assetRepository = assetRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public DashboardMetrics getDashboardMetrics() {
        long totalAssets = assetRepository.count();
        long availableAssets = assetRepository.countByStatus(AssetStatus.AVAILABLE);
        long allocatedAssets = assetRepository.countByStatus(AssetStatus.ALLOCATED);
        long underMaintenance = assetRepository.countByStatus(AssetStatus.UNDER_MAINTENANCE);
        
        long activeBookings = bookingRepository.countByStatus(BookingStatus.ONGOING);
        
        long pendingMaintenance = maintenanceRepository.countByStatus(MaintenanceStatus.PENDING);
        
        long overdueReturns = 0; // Requires logic on bookings

        return new DashboardMetrics(
                totalAssets,
                availableAssets,
                allocatedAssets,
                underMaintenance,
                activeBookings,
                pendingMaintenance,
                overdueReturns
        );
    }
}
