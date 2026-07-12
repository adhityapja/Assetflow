package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.AuditBatchPayload;
import com.odoo.assetflow.dto.AuditCycleDTO;
import com.odoo.assetflow.dto.AuditRecordDTO;
import com.odoo.assetflow.security.CustomUserDetails;
import com.odoo.assetflow.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser().getId();
        }
        return null;
    }

    @GetMapping("/cycles")
    public ResponseEntity<List<AuditCycleDTO>> getAllCycles() {
        return ResponseEntity.ok(auditService.getAllCycles());
    }

    @PostMapping("/cycles")
    public ResponseEntity<AuditCycleDTO> createCycle(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String location = (String) payload.get("location");
        Object deptObj = payload.get("departmentId");
        Long departmentId = null;
        if (deptObj != null) {
            departmentId = Long.valueOf(deptObj.toString());
        }

        Long creatorId = getCurrentUserId();

        return ResponseEntity.ok(auditService.createCycle(name, departmentId, location, creatorId));
    }

    @GetMapping("/cycles/{id}/records")
    public ResponseEntity<List<AuditRecordDTO>> getRecordsForCycle(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getRecordsForCycle(id));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitBatch(@RequestBody AuditBatchPayload payload) {
        auditService.submitBatch(payload);
        return ResponseEntity.ok(Map.of("message", "Batch submitted successfully"));
    }

    @PatchMapping("/cycles/{id}/close")
    public ResponseEntity<AuditCycleDTO> closeCycle(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.closeCycle(id));
    }
}
