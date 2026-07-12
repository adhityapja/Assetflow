package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.ReportDTO;
import com.odoo.assetflow.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<ReportDTO> getReports() {
        return ResponseEntity.ok(reportService.generateReport());
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<String> exportReport() {
        ReportDTO report = reportService.generateReport();
        StringBuilder csv = new StringBuilder();
        csv.append("Category,Assets\n");
        report.assetsByCategory().forEach(c -> csv.append(c.label()).append(",").append(c.value()).append("\n"));
        
        csv.append("\nDepartment,Assets\n");
        report.departmentAllocation().forEach(c -> csv.append(c.label()).append(",").append(c.value()).append("\n"));
        
        csv.append("\nStatus,Assets\n");
        report.assetsByStatus().forEach(c -> csv.append(c.label()).append(",").append(c.value()).append("\n"));
        
        csv.append("\nMost Used Assets,Hours\n");
        report.mostUsedAssets().forEach(c -> csv.append(c.label()).append(",").append(c.value()).append("\n"));
        
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=\"assetflow_report.csv\"")
            .body(csv.toString());
    }
}
