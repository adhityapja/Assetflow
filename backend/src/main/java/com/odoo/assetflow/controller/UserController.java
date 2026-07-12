package com.odoo.assetflow.controller;

import com.odoo.assetflow.model.User;
import com.odoo.assetflow.model.enums.Role;
import com.odoo.assetflow.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        try {
            Role role = Role.valueOf(request.getOrDefault("role", "EMPLOYEE"));
            User created = userService.createUser(
                request.get("name"),
                request.get("email"),
                request.get("password"),
                role
            );
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Role role = request.containsKey("role") ? Role.valueOf((String) request.get("role")) : null;
        Boolean isActive = request.containsKey("isActive") ? (Boolean) request.get("isActive") : null;
        Long departmentId = null;
        if (request.containsKey("departmentId") && request.get("departmentId") != null) {
            departmentId = Long.valueOf(request.get("departmentId").toString());
        }
        
        return ResponseEntity.ok(userService.updateUser(id, role, isActive, departmentId));
    }
}
