package com.odoo.assetflow.dto;

import com.odoo.assetflow.model.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;

public record MaintenanceUpdateDTO(
        @NotNull MaintenanceStatus newStatus,
        String assignedTechnician
) {}
