package com.odoo.assetflow.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookingRequestDTO(
        @NotNull Long assetId,
        @NotNull Long userId,
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime
) {}
