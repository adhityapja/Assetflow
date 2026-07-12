package com.odoo.assetflow.service;

import com.odoo.assetflow.model.Asset;
import com.odoo.assetflow.model.MaintenanceRequest;
import com.odoo.assetflow.model.enums.AssetStatus;
import com.odoo.assetflow.model.enums.MaintenanceStatus;
import com.odoo.assetflow.repository.AssetRepository;
import com.odoo.assetflow.repository.MaintenanceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.odoo.assetflow.dto.MaintenanceRequestDTO;

@Service
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final com.odoo.assetflow.repository.UserRepository userRepository;
    private final com.odoo.assetflow.repository.ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRepository,
                              AssetRepository assetRepository,
                              com.odoo.assetflow.repository.UserRepository userRepository,
                              com.odoo.assetflow.repository.ActivityLogRepository activityLogRepository,
                              NotificationService notificationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository       = assetRepository;
        this.userRepository        = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationService   = notificationService;
    }

    public List<MaintenanceRequestDTO> getAllRequests() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MaintenanceRequestDTO mapToDTO(MaintenanceRequest r) {
        return new MaintenanceRequestDTO(
                r.getId(),
                r.getAsset().getId(),
                r.getAsset().getName(),
                r.getDescription(),
                r.getPriority(),
                r.getStatus().name(),
                r.getAssignedTechnician()
        );
    }

    @Transactional
    public MaintenanceRequestDTO updateStatus(Long requestId,
                                           MaintenanceStatus newStatus,
                                           String technician) {
        MaintenanceRequest request = maintenanceRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                    "Maintenance request not found: " + requestId));

        MaintenanceStatus currentStatus = request.getStatus();

        // Enforce state machine transitions
        validateStateTransition(currentStatus, newStatus);

        // Side effects
        Asset asset = request.getAsset();
        if (newStatus == MaintenanceStatus.APPROVED) {
            asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
            assetRepository.save(asset);
        } else if (newStatus == MaintenanceStatus.RESOLVED) {
            asset.setStatus(AssetStatus.AVAILABLE);
            assetRepository.save(asset);
        }

        if (technician != null && !technician.isBlank()
                && newStatus == MaintenanceStatus.TECHNICIAN_ASSIGNED) {
            request.setAssignedTechnician(technician);
        }

        request.setStatus(newStatus);
        
        // Notification logic
        // We need a requester ID. Since the hackathon entity doesn't store requester on the maintenance request,
        // let's notify the asset owner (assignedUserId) instead if it's allocated.
        if (asset.getAssignedUserId() != null) {
            String msg = "Maintenance request for " + asset.getName() + " is now " + newStatus.name();
            notificationService.createNotification(asset.getAssignedUserId(), msg, "INFO");
        }
        
        return mapToDTO(maintenanceRepository.save(request));
    }

    private void validateStateTransition(MaintenanceStatus current,
                                         MaintenanceStatus next) {
        if (current == MaintenanceStatus.RESOLVED || current == MaintenanceStatus.REJECTED) {
            throw new IllegalStateException("Cannot alter a closed or rejected maintenance record.");
        }

        // Allow same status (e.g., updating technician)
        if (current == next) return;

        boolean isValid = switch (current) {
            case PENDING -> next == MaintenanceStatus.APPROVED || next == MaintenanceStatus.REJECTED;
            case APPROVED -> next == MaintenanceStatus.TECHNICIAN_ASSIGNED || next == MaintenanceStatus.REJECTED;
            case TECHNICIAN_ASSIGNED -> next == MaintenanceStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == MaintenanceStatus.RESOLVED;
            default -> false;
        };

        if (!isValid) {
            throw new IllegalStateException(
                "Invalid state transition from " + current.name() + " to " + next.name()
            );
        }
    }

    @Transactional
    public MaintenanceRequestDTO createRequest(Long assetId, Long requesterId, String description, String priority) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        com.odoo.assetflow.model.User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MaintenanceRequest request = new MaintenanceRequest();
        request.setAsset(asset);
        // request.setRequester(requester); // Doesn't exist on MaintenanceRequest
        request.setDescription(description);
        request.setPriority(priority);
        request.setStatus(MaintenanceStatus.PENDING);

        MaintenanceRequest saved = maintenanceRepository.save(request);
        
        com.odoo.assetflow.model.ActivityLog log = new com.odoo.assetflow.model.ActivityLog(
            requesterId,
            "CREATE",
            "MaintenanceRequest",
            "Raised maintenance request for asset " + asset.getName()
        );
        activityLogRepository.save(log);
        
        return mapToDTO(saved);
    }
}