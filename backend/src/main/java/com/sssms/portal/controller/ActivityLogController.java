package com.sssms.portal.controller;

import com.sssms.portal.entity.ActivityLog;
import com.sssms.portal.entity.LogAction;
import com.sssms.portal.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    /**
     * Get all logs with pagination.
     * Example: GET /api/admin/logs?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getAllLogs(page, size));
    }

    /**
     * Get logs filtered by multiple criteria.
     * Example: GET /api/admin/logs/filter?action=LOGIN&userEmail=admin@sssms.com&page=0&size=20
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<ActivityLog>> getFilteredLogs(
            @RequestParam(required = false) LogAction action,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String userRole,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getFilteredLogs(action, userEmail, userRole, startDate, endDate, page, size));
    }

    /**
     * Get logs by specific action type.
     * Example: GET /api/admin/logs/action/LOGIN?page=0&size=20
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<Page<ActivityLog>> getLogsByAction(
            @PathVariable LogAction action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getLogsByAction(action, page, size));
    }

    /**
     * Get logs by user email.
     * Example: GET /api/admin/logs/user?email=admin@sssms.com&page=0&size=20
     */
    @GetMapping("/user")
    public ResponseEntity<Page<ActivityLog>> getLogsByUser(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getLogsByUser(email, page, size));
    }

    /**
     * Get logs by role.
     * Example: GET /api/admin/logs/role/ROLE_ADMIN?page=0&size=20
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<Page<ActivityLog>> getLogsByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getLogsByRole(role, page, size));
    }

    /**
     * Get error logs only.
     * Example: GET /api/admin/logs/errors?page=0&size=20
     */
    @GetMapping("/errors")
    public ResponseEntity<Page<ActivityLog>> getErrorLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityLogService.getErrorLogs(page, size));
    }

    /**
     * Get log statistics (total logs, error count, action breakdown).
     * Example: GET /api/admin/logs/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLogStats() {
        return ResponseEntity.ok(activityLogService.getLogStats());
    }

    /**
     * Get all available log action types (for frontend filter dropdowns).
     * Example: GET /api/admin/logs/actions
     */
    @GetMapping("/actions")
    public ResponseEntity<LogAction[]> getLogActions() {
        return ResponseEntity.ok(LogAction.values());
    }

    /**
     * Manually purge low-value logs (DATA_VIEWED, UNKNOWN) older than the given days.
     * Example: DELETE /api/admin/logs/purge/low-value?olderThanDays=7
     */
    @DeleteMapping("/purge/low-value")
    public ResponseEntity<Map<String, Object>> purgeLowValueLogs(
            @RequestParam(defaultValue = "7") int olderThanDays) {
        int deleted = activityLogService.purgeLowValueLogs(olderThanDays);
        return ResponseEntity.ok(Map.of(
                "message", "Purged low-value logs older than " + olderThanDays + " days",
                "deletedCount", deleted
        ));
    }

    /**
     * Manually purge ALL logs older than the given days.
     * Example: DELETE /api/admin/logs/purge/all?olderThanDays=90
     */
    @DeleteMapping("/purge/all")
    public ResponseEntity<Map<String, Object>> purgeAllOldLogs(
            @RequestParam(defaultValue = "90") int olderThanDays) {
        int deleted = activityLogService.purgeAllOldLogs(olderThanDays);
        return ResponseEntity.ok(Map.of(
                "message", "Purged all logs older than " + olderThanDays + " days",
                "deletedCount", deleted
        ));
    }
}

