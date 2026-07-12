package com.odoo.assetflow.dto;

public record DashboardMetrics(
    long totalAssets,
    long availableAssets,
    long allocatedAssets,
    long underMaintenance,
    long activeBookings,
    long pendingMaintenance,
    long overdueReturns
) {}
