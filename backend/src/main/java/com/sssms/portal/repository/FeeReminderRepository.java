package com.sssms.portal.repository;

import com.sssms.portal.entity.FeeReminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeReminderRepository extends JpaRepository<FeeReminder, Long> {
    List<FeeReminder> findByActiveTrueOrderByCreatedAtDesc();
}

