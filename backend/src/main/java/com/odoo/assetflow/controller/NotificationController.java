package com.odoo.assetflow.controller;

import com.odoo.assetflow.model.Notification;
import com.odoo.assetflow.security.CustomUserDetails;
import com.odoo.assetflow.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser().getId();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, unreadOnly));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        // ideally verify if notification belongs to user
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
}
