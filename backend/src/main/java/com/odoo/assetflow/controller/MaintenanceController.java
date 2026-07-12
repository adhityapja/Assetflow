package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.MaintenanceUpdateDTO;
import com.odoo.assetflow.dto.MaintenanceRequestDTO;
import com.odoo.assetflow.model.MaintenanceRequest;
import com.odoo.assetflow.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    /** GET /api/v1/maintenance */
    @GetMapping
    public ResponseEntity<List<MaintenanceRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(maintenanceService.getAllRequests());
    }

    /** PATCH /api/v1/maintenance/{requestId}/status */
    @PatchMapping("/{requestId}/status")
    public ResponseEntity<?> updateMaintenanceStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody MaintenanceUpdateDTO request) {
        try {
            MaintenanceRequestDTO updated = maintenanceService.updateStatus(
                    requestId,
                    request.newStatus(),
                    request.assignedTechnician()
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /** POST /api/v1/maintenance */
    @PostMapping
    public ResponseEntity<?> createRequest(@Valid @RequestBody com.odoo.assetflow.dto.MaintenanceCreateDTO request) {
        try {
            MaintenanceRequestDTO created = maintenanceService.createRequest(
                    request.assetId(),
                    request.requesterId(),
                    request.description(),
                    request.priority()
            );
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}