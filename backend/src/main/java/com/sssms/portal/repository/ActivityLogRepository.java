package com.sssms.portal.repository;

import com.sssms.portal.entity.ActivityLog;
import com.sssms.portal.entity.LogAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);

    Page<ActivityLog> findByActionOrderByTimestampDesc(LogAction action, Pageable pageable);

    Page<ActivityLog> findByUserEmailOrderByTimestampDesc(String userEmail, Pageable pageable);

    Page<ActivityLog> findByUserRoleOrderByTimestampDesc(String userRole, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    Page<ActivityLog> findByTimestampBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:userEmail IS NULL OR a.userEmail = :userEmail) AND " +
           "(:userRole IS NULL OR a.userRole = :userRole) AND " +
           "(:start IS NULL OR a.timestamp >= :start) AND " +
           "(:end IS NULL OR a.timestamp <= :end) " +
           "ORDER BY a.timestamp DESC")
    Page<ActivityLog> findWithFilters(
            @Param("action") LogAction action,
            @Param("userEmail") String userEmail,
            @Param("userRole") String userRole,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query("SELECT a.action, COUNT(a) FROM ActivityLog a GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<Object[]> getActionBreakdown();

    @Query("SELECT a FROM ActivityLog a WHERE a.errorMessage IS NOT NULL ORDER BY a.timestamp DESC")
    Page<ActivityLog> findErrors(Pageable pageable);

    long countByAction(LogAction action);

    @Modifying
    @Transactional
    @Query("DELETE FROM ActivityLog a WHERE a.action = :action AND a.timestamp < :before")
    int deleteByActionAndTimestampBefore(@Param("action") LogAction action, @Param("before") LocalDateTime before);

    @Modifying
    @Transactional
    @Query("DELETE FROM ActivityLog a WHERE a.action IN :actions AND a.timestamp < :before")
    int deleteByActionInAndTimestampBefore(@Param("actions") List<LogAction> actions, @Param("before") LocalDateTime before);

    @Modifying
    @Transactional
    @Query("DELETE FROM ActivityLog a WHERE a.timestamp < :before")
    int deleteByTimestampBefore(@Param("before") LocalDateTime before);
}

