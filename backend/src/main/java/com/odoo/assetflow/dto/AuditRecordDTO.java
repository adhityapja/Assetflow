package com.odoo.assetflow.dto;

public class AuditRecordDTO {
    private Long id;
    private Long assetId;
    private String assetName;
    private String serialNumber;
    private String category;
    private String location;
    private String expectedStatus;
    private String auditResult;
    private String notes;

    public AuditRecordDTO() {}

    public AuditRecordDTO(Long id, Long assetId, String assetName, String serialNumber, String category, String location, String expectedStatus, String auditResult, String notes) {
        this.id = id;
        this.assetId = assetId;
        this.assetName = assetName;
        this.serialNumber = serialNumber;
        this.category = category;
        this.location = location;
        this.expectedStatus = expectedStatus;
        this.auditResult = auditResult;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public Long getAssetId() { return assetId; }
    public String getAssetName() { return assetName; }
    public String getSerialNumber() { return serialNumber; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getExpectedStatus() { return expectedStatus; }
    public String getAuditResult() { return auditResult; }
    public String getNotes() { return notes; }
}
