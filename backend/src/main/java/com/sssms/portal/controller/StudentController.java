//check

package com.sssms.portal.controller;

import com.sssms.portal.entity.*;
import com.sssms.portal.repository.*;
import com.sssms.portal.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ResourceRepository resourceRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final ExamResultRepository resultRepository;
    private final StudentMarkRepository studentMarkRepository;
    private final com.sssms.portal.service.GradingService gradingService;
    private final FeeRepository feeRepository;
    private final FeeReminderRepository feeReminderRepository;

    @GetMapping("/my-attendance")
    public ResponseEntity<?> getMyAttendance(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(studentService.getMyAttendance(user.getUserId()));
    }

    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        List<ExamResult> results = resultRepository.findByStudentId(student.getId());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/my-assessments")
    public ResponseEntity<?> getMyAssessments(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(user.getUserId()).orElseThrow();

        List<StudentMark> marks = studentMarkRepository.findByStudentId(student.getId());

        List<Map<String, Object>> response = marks.stream().map(m -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", m.getId());
            map.put("subjectName", m.getAssessment().getAllocation().getSubject().getName());
            map.put("subjectCode", m.getAssessment().getAllocation().getSubject().getCode());

            map.put("examType", m.getAssessment().getTitle());
            map.put("obtained", m.getMarksObtained());
            map.put("max", m.getAssessment().getMaxMarks());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
        public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            return ResponseEntity.ok(studentService.getProfile(user.getUserId()));
    }

    @GetMapping("/resources/{subjectCode}")
    public ResponseEntity<?> getResourcesForSubject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String subjectCode
    ) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        SubjectAllocation allocation = allocationRepository.findAll().stream()
                .filter(a -> a.getSubject().getCode().equalsIgnoreCase(subjectCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Subject Code mismatch"));

        List<AcademicResource> resources = resourceRepository.findByAllocationId(allocation.getId());

        List<Map<String, Object>> response = resources.stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("title", r.getTitle());
            map.put("fileName", r.getFileName());
            map.put("date", r.getUploadDate());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/report-card")
        public ResponseEntity<?> getReportCard(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            return ResponseEntity.ok(gradingService.generateReportCard(user.getUserId()));
        }

    @GetMapping("/my-fee-status")
    public ResponseEntity<?> getMyFeeStatus(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Map<String, Object> result = new HashMap<>();

        // Fee record
        FeeRecord feeRecord = feeRepository.findByStudentId(user.getUserId()).orElse(null);
        if (feeRecord != null) {
            result.put("hasFeeRecord", true);
            result.put("totalFee", feeRecord.getTotalFee());
            result.put("paidAmount", feeRecord.getPaidAmount());
            result.put("scholarshipAmount", feeRecord.getScholarshipAmount());
            double effectiveBalance = feeRecord.getTotalFee() - feeRecord.getPaidAmount() - feeRecord.getScholarshipAmount();
            result.put("balance", Math.max(effectiveBalance, 0));
            result.put("status", effectiveBalance <= 0 ? "PAID" : "PENDING");
        } else {
            result.put("hasFeeRecord", false);
        }

        // Scholarship status
        Student student = studentRepository.findById(user.getUserId()).orElse(null);
        result.put("scholarshipStatus", student != null && student.getScholarshipStatus() != null
                ? student.getScholarshipStatus().name() : "NOT_APPLIED");

        // Active reminders
        List<Map<String, Object>> reminders = feeReminderRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("title", r.getTitle());
                    map.put("message", r.getMessage());
                    map.put("dueDate", r.getDueDate());
                    map.put("createdAt", r.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());
        result.put("reminders", reminders);

        return ResponseEntity.ok(result);
    }
}