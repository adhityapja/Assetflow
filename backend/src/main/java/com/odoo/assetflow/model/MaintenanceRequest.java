package com.odoo.assetflow.model;

import com.odoo.assetflow.model.enums.MaintenanceStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String priority = "MEDIUM";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MaintenanceStatus status = MaintenanceStatus.PENDING;

    @Column(name = "assigned_technician", length = 150)
    private String assignedTechnician;

    public MaintenanceRequest() {}

    public Long getId()                               { return id; }
    public Asset getAsset()                           { return asset; }
    public void setAsset(Asset a)                     { this.asset = a; }
    public String getDescription()                    { return description; }
    public void setDescription(String d)              { this.description = d; }
    public String getPriority()                       { return priority; }
    public void setPriority(String p)                 { this.priority = p; }
    public MaintenanceStatus getStatus()              { return status; }
    public void setStatus(MaintenanceStatus s)        { this.status = s; }
    public String getAssignedTechnician()             { return assignedTechnician; }
    public void setAssignedTechnician(String t)       { this.assignedTechnician = t; }
}
