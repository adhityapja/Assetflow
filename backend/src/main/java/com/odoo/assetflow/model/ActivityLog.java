package com.odoo.assetflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(nullable = false, length = 100)
    private String entity;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public ActivityLog() {}

    public ActivityLog(Long userId, String action, String entity, String details) {
        this.userId = userId;
        this.action = action;
        this.entity = entity;
        this.details = details;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getAction() { return action; }
    public String getEntity() { return entity; }
    public String getDetails() { return details; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
