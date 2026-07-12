package com.odoo.assetflow.service;

import com.odoo.assetflow.dto.AuditBatchPayload;
import com.odoo.assetflow.dto.AuditCycleDTO;
import com.odoo.assetflow.dto.AuditRecordDTO;
import com.odoo.assetflow.model.Asset;
import com.odoo.assetflow.model.AuditCycle;
import com.odoo.assetflow.model.AuditRecord;
import com.odoo.assetflow.model.enums.AssetStatus;
import com.odoo.assetflow.repository.AssetRepository;
import com.odoo.assetflow.repository.AuditCycleRepository;
import com.odoo.assetflow.repository.AuditRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final AuditCycleRepository auditCycleRepository;
    private final AuditRecordRepository auditRecordRepository;
    private final AssetRepository assetRepository;
    private final NotificationService notificationService;

    public AuditService(AuditCycleRepository auditCycleRepository,
                        AuditRecordRepository auditRecordRepository,
                        AssetRepository assetRepository,
                        NotificationService notificationService) {
        this.auditCycleRepository = auditCycleRepository;
        this.auditRecordRepository = auditRecordRepository;
        this.assetRepository = assetRepository;
        this.notificationService = notificationService;
    }

    public List<AuditCycleDTO> getAllCycles() {
        return auditCycleRepository.findAll().stream()
                .map(this::mapToCycleDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AuditCycleDTO createCycle(String name, Long departmentId, String location, Long creatorId) {
        AuditCycle cycle = new AuditCycle();
        cycle.setName(name);
        cycle.setDepartmentId(departmentId);
        cycle.setLocation(location);
        cycle.setCreatedBy(creatorId);
        cycle.setStatus("OPEN");

        cycle = auditCycleRepository.save(cycle);

        // Auto-generate records based on scope
        List<Asset> assets;
        // In a real app, we'd query by department/location. Here we just get all for now to keep it simple, or filter them.
        assets = assetRepository.findAll();
        
        if (location != null && !location.isBlank()) {
            assets = assets.stream().filter(a -> location.equalsIgnoreCase(a.getLocation())).collect(Collectors.toList());
        }
        
        for (Asset asset : assets) {
            AuditRecord record = new AuditRecord();
            record.setAuditCycle(cycle);
            record.setAsset(asset);
            record.setExpectedStatus(asset.getStatus());
            record.setAuditResult("UNREVIEWED");
            auditRecordRepository.save(record);
        }

        return mapToCycleDTO(cycle);
    }

    public List<AuditRecordDTO> getRecordsForCycle(Long cycleId) {
        return auditRecordRepository.findByAuditCycleId(cycleId).stream()
                .map(this::mapToRecordDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void submitBatch(AuditBatchPayload payload) {
        AuditCycle cycle = auditCycleRepository.findById(payload.getAuditCycleId())
                .orElseThrow(() -> new RuntimeException("Audit cycle not found"));

        if (!"OPEN".equals(cycle.getStatus())) {
            throw new RuntimeException("Cannot submit records for a closed cycle");
        }

        List<AuditRecord> records = auditRecordRepository.findByAuditCycleId(cycle.getId());
        
        for (AuditBatchPayload.AuditBatchItem item : payload.getItems()) {
            records.stream()
                .filter(r -> r.getAsset().getId().equals(item.getAssetId()))
                .findFirst()
                .ifPresent(r -> {
                    r.setAuditResult(item.getResult());
                    r.setNotes(item.getNotes());
                    auditRecordRepository.save(r);
                });
        }
    }

    @Transactional
    public AuditCycleDTO closeCycle(Long cycleId) {
        AuditCycle cycle = auditCycleRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Audit cycle not found"));
                
        cycle.setStatus("CLOSED");
        cycle.setEndDate(LocalDateTime.now());
        
        // Update actual asset statuses based on audit results
        List<AuditRecord> records = auditRecordRepository.findByAuditCycleId(cycleId);
        for (AuditRecord record : records) {
            Asset asset = record.getAsset();
            if ("MISSING".equals(record.getAuditResult())) {
                asset.setStatus(AssetStatus.LOST);
                assetRepository.save(asset);
                // notify owner if assigned
                if (asset.getAssignedUserId() != null) {
                    notificationService.createNotification(asset.getAssignedUserId(), "Asset " + asset.getName() + " was marked as MISSING during audit.", "ALERT");
                }
            } else if ("DAMAGED".equals(record.getAuditResult())) {
                asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
                assetRepository.save(asset);
                if (asset.getAssignedUserId() != null) {
                    notificationService.createNotification(asset.getAssignedUserId(), "Asset " + asset.getName() + " was marked as DAMAGED during audit.", "WARNING");
                }
            }
        }
        
        return mapToCycleDTO(auditCycleRepository.save(cycle));
    }

    private AuditCycleDTO mapToCycleDTO(AuditCycle c) {
        return new AuditCycleDTO(
                c.getId(),
                c.getName(),
                c.getDepartmentId(),
                c.getLocation(),
                c.getStartDate() != null ? c.getStartDate().toString() : null,
                c.getEndDate() != null ? c.getEndDate().toString() : null,
                c.getStatus()
        );
    }

    private AuditRecordDTO mapToRecordDTO(AuditRecord r) {
        return new AuditRecordDTO(
                r.getId(),
                r.getAsset().getId(),
                r.getAsset().getName(),
                r.getAsset().getAssetTag(), // serialNumber
                r.getAsset().getCategory(),
                r.getAsset().getLocation(),
                r.getExpectedStatus().name(),
                r.getAuditResult(),
                r.getNotes()
        );
    }
}
