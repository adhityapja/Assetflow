package com.odoo.assetflow.dto;

import java.time.LocalDateTime;

public record BookingDTO(
    Long id,
    Long assetId,
    String assetName,
    Long userId,
    String userName,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String status
) {}
