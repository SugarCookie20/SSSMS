package com.sssms.portal.controller;

import com.sssms.portal.entity.FeeReminder;
import com.sssms.portal.entity.User;
import com.sssms.portal.repository.FeeReminderRepository;
import com.sssms.portal.repository.UserRepository;
import com.sssms.portal.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/fees")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FeeController {

    private final FeeService feeService;
    private final FeeReminderRepository feeReminderRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllFees() {
        return ResponseEntity.ok(feeService.getAllFeeRecords());
    }

    @PostMapping("/init")
    public ResponseEntity<?> initializeFee(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        double amount = Double.parseDouble(payload.get("amount").toString());
        feeService.initializeFee(studentId, amount);
        return ResponseEntity.ok("Fee Initialized");
    }

    @PostMapping("/pay")
    public ResponseEntity<?> recordPayment(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        double amount = Double.parseDouble(payload.get("amount").toString());
        feeService.recordPayment(studentId, amount);
        return ResponseEntity.ok("Payment Recorded");
    }

    // ==================== FEE REMINDERS ====================

    @GetMapping("/reminders")
    public ResponseEntity<?> getAllReminders() {
        List<Map<String, Object>> result = feeReminderRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("title", r.getTitle());
                    map.put("message", r.getMessage());
                    map.put("dueDate", r.getDueDate());
                    map.put("active", r.isActive());
                    map.put("createdAt", r.getCreatedAt());
                    map.put("createdBy", r.getCreatedBy() != null ? r.getCreatedBy().getEmail() : "Admin");
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reminders")
    public ResponseEntity<?> createReminder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        FeeReminder reminder = FeeReminder.builder()
                .title(payload.get("title"))
                .message(payload.get("message"))
                .dueDate(payload.get("dueDate") != null && !payload.get("dueDate").isEmpty()
                        ? LocalDate.parse(payload.get("dueDate")) : null)
                .active(true)
                .createdAt(LocalDateTime.now())
                .createdBy(admin)
                .build();

        feeReminderRepository.save(reminder);
        return ResponseEntity.ok("Fee Reminder Created");
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id) {
        feeReminderRepository.deleteById(id);
        return ResponseEntity.ok("Reminder Deleted");
    }

    @PutMapping("/reminders/{id}/deactivate")
    public ResponseEntity<?> deactivateReminder(@PathVariable Long id) {
        FeeReminder reminder = feeReminderRepository.findById(id).orElseThrow();
        reminder.setActive(false);
        feeReminderRepository.save(reminder);
        return ResponseEntity.ok("Reminder Deactivated");
    }

    // ==================== PENDING FEE STATS ====================

    @GetMapping("/pending-count")
    public ResponseEntity<?> getPendingCount() {
        List<Map<String, Object>> allRecords = feeService.getAllFeeRecords();
        long pendingCount = allRecords.stream()
                .filter(r -> "PENDING".equals(r.get("status")))
                .count();
        double totalPending = allRecords.stream()
                .filter(r -> "PENDING".equals(r.get("status")))
                .mapToDouble(r -> ((Number) r.get("balance")).doubleValue())
                .sum();
        return ResponseEntity.ok(Map.of(
                "pendingCount", pendingCount,
                "totalPending", totalPending,
                "totalStudents", allRecords.size()
        ));
    }
}