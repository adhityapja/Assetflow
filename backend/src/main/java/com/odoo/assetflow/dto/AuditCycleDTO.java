package com.odoo.assetflow.dto;

public class AuditCycleDTO {
    private Long id;
    private String name;
    private Long departmentId;
    private String location;
    private String startDate;
    private String endDate;
    private String status;

    public AuditCycleDTO() {}

    public AuditCycleDTO(Long id, String name, Long departmentId, String location, String startDate, String endDate, String status) {
        this.id = id;
        this.name = name;
        this.departmentId = departmentId;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Long getDepartmentId() { return departmentId; }
    public String getLocation() { return location; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public String getStatus() { return status; }
}
