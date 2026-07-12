package com.odoo.assetflow.controller;

import com.odoo.assetflow.model.AssetCategory;
import com.odoo.assetflow.service.AssetCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AssetCategoryController {

    private final AssetCategoryService assetCategoryService;

    public AssetCategoryController(AssetCategoryService assetCategoryService) {
        this.assetCategoryService = assetCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<AssetCategory>> getAllCategories() {
        return ResponseEntity.ok(assetCategoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");
            String customFields = (String) payload.get("customFields");
            
            AssetCategory category = assetCategoryService.createCategory(name, description, customFields);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");
            String customFields = (String) payload.get("customFields");
            Boolean isActive = payload.containsKey("isActive") ? (Boolean) payload.get("isActive") : null;

            AssetCategory category = assetCategoryService.updateCategory(id, name, description, customFields, isActive);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
