package com.odoo.assetflow.service;

import com.odoo.assetflow.dto.ReportDTO;
import com.odoo.assetflow.repository.AssetRepository;
import com.odoo.assetflow.repository.MaintenanceRequestRepository;
import com.odoo.assetflow.repository.BookingRepository;
import com.odoo.assetflow.model.Booking;
import com.odoo.assetflow.dto.ChartDataDTO;
import com.odoo.assetflow.dto.BookingHeatmapDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.DayOfWeek;
import java.time.temporal.ChronoUnit;

@Service
public class ReportService {

    private final AssetRepository assetRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final BookingRepository bookingRepository;

    public ReportService(AssetRepository assetRepository,
                         MaintenanceRequestRepository maintenanceRepository,
                         BookingRepository bookingRepository) {
        this.assetRepository = assetRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.bookingRepository = bookingRepository;
    }

    public ReportDTO generateReport() {
        List<Booking> allBookings = bookingRepository.findAll();
        
        // Calculate most used assets
        Map<String, Long> assetUsageHours = new HashMap<>();
        for (Booking b : allBookings) {
            long hours = ChronoUnit.HOURS.between(b.getStartTime(), b.getEndTime());
            if (hours < 1) hours = 1; // minimum 1 hour per booking
            String assetName = b.getAsset() != null ? b.getAsset().getName() : "Unknown";
            assetUsageHours.put(assetName, assetUsageHours.getOrDefault(assetName, 0L) + hours);
        }
        
        List<ChartDataDTO> mostUsedAssets = assetUsageHours.entrySet().stream()
            .map(e -> new ChartDataDTO(e.getKey(), e.getValue()))
            .sorted((a, b) -> Long.compare(b.value(), a.value()))
            .limit(5)
            .collect(Collectors.toList());

        // Calculate booking heatmap
        Map<String, Long> heatmapCounts = new HashMap<>();
        for (Booking b : allBookings) {
            int day = b.getStartTime().getDayOfWeek().getValue(); // 1 (Mon) - 7 (Sun)
            int hour = b.getStartTime().getHour();
            String key = day + "-" + hour;
            heatmapCounts.put(key, heatmapCounts.getOrDefault(key, 0L) + 1L);
        }
        
        List<BookingHeatmapDTO> bookingHeatmap = heatmapCounts.entrySet().stream()
            .map(e -> {
                String[] parts = e.getKey().split("-");
                return new BookingHeatmapDTO(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), e.getValue());
            })
            .collect(Collectors.toList());

        return new ReportDTO(
            assetRepository.countAssetsByCategory(),
            assetRepository.countAssetsByStatus(),
            maintenanceRepository.countMaintenanceByStatus(),
            assetRepository.countAssetsByDepartment(),
            mostUsedAssets,
            maintenanceRepository.countMaintenanceByCategory(),
            assetRepository.findAssetsNeedingAttention(),
            bookingHeatmap
        );
    }
}
