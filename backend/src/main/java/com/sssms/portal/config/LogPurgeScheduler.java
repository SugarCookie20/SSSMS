package com.sssms.portal.config;

import com.sssms.portal.entity.LogAction;
import com.sssms.portal.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job to purge old activity logs and prevent the table from growing unbounded.
 *
 * - DATA_VIEWED / UNKNOWN logs are low-value and purged after a short retention (default 7 days).
 * - All other logs (LOGIN, ERROR, enrollments, etc.) are high-value audit entries
 *   and kept longer (default 90 days).
 *
 * Retention periods are configurable via application.properties.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LogPurgeScheduler {

    private final ActivityLogRepository activityLogRepository;

    /** Days to keep low-value logs like DATA_VIEWED, UNKNOWN */
    @Value("${logging.purge.low-value-retention-days:7}")
    private int lowValueRetentionDays;

    /** Days to keep important audit logs (LOGIN, ERROR, enrollments, etc.) */
    @Value("${logging.purge.high-value-retention-days:90}")
    private int highValueRetentionDays;

    private static final List<LogAction> LOW_VALUE_ACTIONS = List.of(
            LogAction.DATA_VIEWED,
            LogAction.UNKNOWN
    );

    /**
     * Runs every day at 2:00 AM to clean up old logs.
     */
    @Scheduled(cron = "${logging.purge.cron:0 0 2 * * *}")
    public void purgeOldLogs() {
        log.info("Starting scheduled log purge...");

        // 1. Purge low-value logs older than the short retention
        LocalDateTime lowValueCutoff = LocalDateTime.now().minusDays(lowValueRetentionDays);
        int lowValueDeleted = activityLogRepository.deleteByActionInAndTimestampBefore(LOW_VALUE_ACTIONS, lowValueCutoff);
        log.info("Purged {} low-value logs (DATA_VIEWED/UNKNOWN) older than {} days", lowValueDeleted, lowValueRetentionDays);

        // 2. Purge all remaining logs older than the long retention
        LocalDateTime highValueCutoff = LocalDateTime.now().minusDays(highValueRetentionDays);
        int highValueDeleted = activityLogRepository.deleteByTimestampBefore(highValueCutoff);
        log.info("Purged {} audit logs older than {} days", highValueDeleted, highValueRetentionDays);

        log.info("Log purge complete.");
    }
}

