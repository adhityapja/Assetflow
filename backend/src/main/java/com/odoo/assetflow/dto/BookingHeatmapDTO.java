package com.odoo.assetflow.dto;

public record BookingHeatmapDTO(
    Integer dayOfWeek, // 1 (Mon) - 7 (Sun)
    Integer hourOfDay, // 0 - 23
    Long count
) {}
