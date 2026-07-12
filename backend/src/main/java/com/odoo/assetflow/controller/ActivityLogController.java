package com.odoo.assetflow.controller;

import com.odoo.assetflow.model.ActivityLog;
import com.odoo.assetflow.repository.ActivityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activity-logs")
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogController(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllLogs() {
        return ResponseEntity.ok(activityLogRepository.findAllByOrderByTimestampDesc());
    }
}
