package com.odoo.assetflow.model;

import com.odoo.assetflow.model.enums.AssetStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "audit_records")
public class AuditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_cycle_id", nullable = false)
    private AuditCycle auditCycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(name = "expected_status", nullable = false, length = 30)
    private AssetStatus expectedStatus;

    @Column(name = "audit_result", nullable = false, length = 20)
    private String auditResult = "UNREVIEWED"; // UNREVIEWED, VERIFIED, MISSING, DAMAGED

    @Column(columnDefinition = "TEXT")
    private String notes;

    public AuditRecord() {}

    public Long getId() { return id; }
    
    public AuditCycle getAuditCycle() { return auditCycle; }
    public void setAuditCycle(AuditCycle auditCycle) { this.auditCycle = auditCycle; }
    
    public Asset getAsset() { return asset; }
    public void setAsset(Asset asset) { this.asset = asset; }
    
    public AssetStatus getExpectedStatus() { return expectedStatus; }
    public void setExpectedStatus(AssetStatus expectedStatus) { this.expectedStatus = expectedStatus; }
    
    public String getAuditResult() { return auditResult; }
    public void setAuditResult(String auditResult) { this.auditResult = auditResult; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
