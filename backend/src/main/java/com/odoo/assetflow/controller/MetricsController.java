package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.DashboardMetrics;
import com.odoo.assetflow.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/metrics")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetrics> getDashboardMetrics() {
        return ResponseEntity.ok(metricsService.getDashboardMetrics());
    }
}
