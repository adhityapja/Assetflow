package com.odoo.assetflow.dto;

public record MaintenanceRequestDTO(
    Long id,
    Long assetId,
    String assetName,
    String description,
    String priority,
    String status,
    String assignedTechnician
) {}
