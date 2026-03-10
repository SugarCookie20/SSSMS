package com.sssms.portal.repository;

import com.sssms.portal.entity.Notice;
import com.sssms.portal.entity.TargetRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    List<Notice> findAllByOrderByDateDesc();

    @Query("SELECT n FROM Notice n WHERE n.targetRole = :role OR n.targetRole = 'ALL' ORDER BY n.date DESC")
    List<Notice> findByTargetRoleOrAll(TargetRole role);

    @Query("SELECT n FROM Notice n WHERE (n.expiresAt IS NULL OR n.expiresAt > :now) ORDER BY n.date DESC")
    List<Notice> findAllActiveByOrderByDateDesc(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notice n WHERE (n.targetRole = :role OR n.targetRole = 'ALL') AND (n.expiresAt IS NULL OR n.expiresAt > :now) ORDER BY n.date DESC")
    List<Notice> findActiveByTargetRoleOrAll(@Param("role") TargetRole role, @Param("now") LocalDateTime now);
}