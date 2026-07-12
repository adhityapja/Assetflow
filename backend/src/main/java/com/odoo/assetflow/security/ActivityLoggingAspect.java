package com.odoo.assetflow.security;

import com.odoo.assetflow.model.ActivityLog;
import com.odoo.assetflow.repository.ActivityLogRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ActivityLoggingAspect {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLoggingAspect(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @AfterReturning(pointcut = "execution(* com.odoo.assetflow.controller.AssetController.createAsset(..))", returning = "result")
    public void logAssetCreation(JoinPoint joinPoint, Object result) {
        saveLog("CREATE", "Asset", "Created new asset");
    }

    @AfterReturning(pointcut = "execution(* com.odoo.assetflow.controller.AssetController.allocateAsset(..))", returning = "result")
    public void logAssetAllocation(JoinPoint joinPoint, Object result) {
        saveLog("ALLOCATE", "Asset", "Allocated asset to a user");
    }

    @AfterReturning(pointcut = "execution(* com.odoo.assetflow.controller.AssetController.deallocateAsset(..))", returning = "result")
    public void logAssetDeallocation(JoinPoint joinPoint, Object result) {
        saveLog("DEALLOCATE", "Asset", "Deallocated asset from user");
    }

    @AfterReturning(pointcut = "execution(* com.odoo.assetflow.controller.BookingController.createBooking(..))", returning = "result")
    public void logBookingCreation(JoinPoint joinPoint, Object result) {
        saveLog("CREATE", "Booking", "Created a new booking");
    }

    @AfterReturning(pointcut = "execution(* com.odoo.assetflow.controller.MaintenanceController.updateMaintenanceStatus(..))", returning = "result")
    public void logMaintenanceUpdate(JoinPoint joinPoint, Object result) {
        saveLog("UPDATE", "Maintenance Request", "Updated maintenance status");
    }

    private void saveLog(String action, String entity, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            userId = userDetails.getUser().getId();
        }
        
        // Save log asynchronously or synchronously
        activityLogRepository.save(new ActivityLog(userId, action, entity, details));
    }
}
