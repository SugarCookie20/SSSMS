package com.sssms.portal.service;

import com.sssms.portal.entity.ActivityLog;
import com.sssms.portal.entity.LogAction;
import com.sssms.portal.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public Page<ActivityLog> getAllLogs(int page, int size) {
        return activityLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
    }

    public Page<ActivityLog> getLogsByAction(LogAction action, int page, int size) {
        return activityLogRepository.findByActionOrderByTimestampDesc(action, PageRequest.of(page, size));
    }

    public Page<ActivityLog> getLogsByUser(String userEmail, int page, int size) {
        return activityLogRepository.findByUserEmailOrderByTimestampDesc(userEmail, PageRequest.of(page, size));
    }

    public Page<ActivityLog> getLogsByRole(String role, int page, int size) {
        return activityLogRepository.findByUserRoleOrderByTimestampDesc(role, PageRequest.of(page, size));
    }

    public Page<ActivityLog> getFilteredLogs(LogAction action, String userEmail, String userRole,
                                              LocalDateTime start, LocalDateTime end, int page, int size) {
        return activityLogRepository.findWithFilters(action, userEmail, userRole, start, end, PageRequest.of(page, size));
    }

    public Page<ActivityLog> getErrorLogs(int page, int size) {
        return activityLogRepository.findErrors(PageRequest.of(page, size));
    }

    public Map<String, Object> getLogStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", activityLogRepository.count());
        stats.put("totalErrors", activityLogRepository.countByAction(LogAction.ERROR));
        stats.put("actionBreakdown", activityLogRepository.getActionBreakdown());
        return stats;
    }

    /**
     * Purge low-value logs (DATA_VIEWED, UNKNOWN) older than the given number of days.
     */
    public int purgeLowValueLogs(int olderThanDays) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(olderThanDays);
        return activityLogRepository.deleteByActionInAndTimestampBefore(
                List.of(LogAction.DATA_VIEWED, LogAction.UNKNOWN), cutoff);
    }

    /**
     * Purge ALL logs older than the given number of days.
     */
    public int purgeAllOldLogs(int olderThanDays) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(olderThanDays);
        return activityLogRepository.deleteByTimestampBefore(cutoff);
    }
}

