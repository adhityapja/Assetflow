package com.odoo.assetflow.service;

import com.odoo.assetflow.model.Notification;
import com.odoo.assetflow.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getUserNotifications(Long userId, boolean unreadOnly) {
        if (unreadOnly) {
            return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setRead(true);
        return notificationRepository.save(notif);
    }

    public void createNotification(Long userId, String message, String type) {
        if (userId == null) return;
        notificationRepository.save(new Notification(userId, message, type));
    }
}
