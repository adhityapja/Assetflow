package com.odoo.assetflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MaintenanceCreateDTO(
    @NotNull Long assetId,
    @NotNull Long requesterId,
    @NotBlank String description,
    @NotBlank String priority
) {}
