package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.AssetDTO;
import com.odoo.assetflow.service.AssetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<List<AssetDTO>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<?> createAsset(@RequestBody Map<String, Object> payload) {
        try {
            AssetDTO created = assetService.createAsset(
                (String) payload.get("name"),
                (String) payload.get("serialNumber"),
                (String) payload.get("category"),
                (String) payload.get("location"),
                (Boolean) payload.getOrDefault("isSharedBookable", false)
            );
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/allocate/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<?> allocateAsset(@PathVariable Long id, @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(assetService.allocateAsset(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/deallocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')")
    public ResponseEntity<?> deallocateAsset(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(assetService.deallocateAsset(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/transfer-request")
    public ResponseEntity<?> requestTransfer(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long requesterId = Long.valueOf(payload.get("requesterId").toString());
            String reason = payload.get("reason").toString();
            assetService.requestTransfer(id, requesterId, reason);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
