package com.odoo.assetflow.controller;

import com.odoo.assetflow.model.Department;
import com.odoo.assetflow.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
@PreAuthorize("hasRole('ADMIN')")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            Long headUserId = payload.containsKey("headUserId") && payload.get("headUserId") != null ? Long.valueOf(payload.get("headUserId").toString()) : null;
            Long parentId = payload.containsKey("parentId") && payload.get("parentId") != null ? Long.valueOf(payload.get("parentId").toString()) : null;
            
            Department dept = departmentService.createDepartment(name, headUserId, parentId);
            return ResponseEntity.ok(dept);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            Long headUserId = payload.containsKey("headUserId") && payload.get("headUserId") != null ? Long.valueOf(payload.get("headUserId").toString()) : null;
            Long parentId = payload.containsKey("parentId") && payload.get("parentId") != null ? Long.valueOf(payload.get("parentId").toString()) : null;
            Boolean isActive = payload.containsKey("isActive") ? (Boolean) payload.get("isActive") : null;

            Department dept = departmentService.updateDepartment(id, name, headUserId, parentId, isActive);
            return ResponseEntity.ok(dept);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
