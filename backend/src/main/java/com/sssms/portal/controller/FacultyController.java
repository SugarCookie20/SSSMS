//check

package com.sssms.portal.controller;

import com.sssms.portal.dto.request.AssessmentRequest;
import com.sssms.portal.dto.request.AttendanceRequest;
import com.sssms.portal.entity.*;
import com.sssms.portal.repository.*;
import com.sssms.portal.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final SubjectAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final FacultyService facultyService;
    private final StudentRepository studentRepository;
    private final com.sssms.portal.service.StudentService studentService;
    private final com.sssms.portal.service.GradingService gradingService;
    private final ProfessionalDevelopmentRepository pdRepository;

    @GetMapping("/my-subjects")
    public ResponseEntity<?> getMySubjects(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Faculty faculty = facultyRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Faculty profile not found"));

        List<SubjectAllocation> allocations = allocationRepository.findByFacultyId(faculty.getId());

        List<Map<String, Object>> response = allocations.stream().map(a -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", a.getId());
            map.put("subjectName", a.getSubject().getName());
            map.put("subjectCode", a.getSubject().getCode());
            map.put("className", a.getSubject().getAcademicYear() != null ? a.getSubject().getAcademicYear().toString() : "N/A");
            map.put("division", "");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/allocation/{id}/students")
    public ResponseEntity<List<Student>> getStudents(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getStudentsForAllocation(id));
    }

    @PostMapping("/attendance")
    public ResponseEntity<String> submitAttendance(@RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(facultyService.markAttendance(request));
    }

    @GetMapping("/attendance/{allocationId}/date")
    public ResponseEntity<?> getAttendanceForDate(
            @PathVariable Long allocationId,
            @RequestParam String date) {
        return ResponseEntity.ok(facultyService.getAttendanceForDate(allocationId, LocalDate.parse(date)));
    }

    @PutMapping("/attendance/{sessionId}")
    public ResponseEntity<String> updateAttendance(
            @PathVariable Long sessionId,
            @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(facultyService.updateAttendance(sessionId, request));
    }

    @DeleteMapping("/attendance/{sessionId}")
    public ResponseEntity<String> deleteAttendanceSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(facultyService.deleteAttendanceSession(sessionId));
    }

    @GetMapping("/attendance/{allocationId}/sessions")
    public ResponseEntity<?> getAttendanceSessions(@PathVariable Long allocationId) {
        return ResponseEntity.ok(facultyService.getSessionsForAllocation(allocationId));
    }

    @GetMapping("/report/{allocationId}")
    public ResponseEntity<?> getAttendanceReport(
            @PathVariable Long allocationId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        LocalDate start = (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;

        return ResponseEntity.ok(facultyService.getAttendanceReport(allocationId, start, end));
    }

    @PostMapping("/assessment")
    public ResponseEntity<String> createAssessment(@RequestBody AssessmentRequest request) {
        return ResponseEntity.ok(facultyService.createAssessment(request));
    }

    @GetMapping("/report/download/{allocationId}")
        public ResponseEntity<Resource> downloadAttendanceReport(
                @PathVariable Long allocationId,
                @RequestParam(required = false) String startDate,
                @RequestParam(required = false) String endDate
        ) {
            LocalDate start = (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
            LocalDate end = (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;

            InputStreamResource file = new InputStreamResource(facultyService.generateAttendanceCSV(allocationId, start, end));
            String filename = "Attendance_Report_" + allocationId + ".csv";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("application/csv"))
                    .body(file);
        }

    @GetMapping("/report/pdf/{allocationId}")
    public ResponseEntity<Resource> downloadAttendancePDF(
            @PathVariable Long allocationId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        LocalDate start = (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
        LocalDate end = (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;

        InputStreamResource file = new InputStreamResource(facultyService.generateAttendancePDF(allocationId, start, end));
        String filename = "Attendance_Report_" + allocationId + ".html";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/html; charset=UTF-8"))
                .body(file);
    }

    @GetMapping("/student/{id}/profile")
        public ResponseEntity<?> getStudentProfile(
                @AuthenticationPrincipal UserDetails userDetails,
                @PathVariable Long id
        ) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User facultyUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            Student student = studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));

            List<SubjectAllocation> facultyAllocations = allocationRepository.findByFacultyId(facultyUser.getUserId());

            boolean isTeaching = facultyAllocations.stream().anyMatch(allocation -> {
                if (allocation.getSubject().getAcademicYear() == student.getAcademicYear()) return true;

                return student.getExtraCourses().contains(allocation);
            });

            if (!isTeaching) {
                return ResponseEntity.status(403).body("You are not authorized to view this student's profile.");
            }

            return ResponseEntity.ok(studentService.getProfile(id));
        }

    @GetMapping("/profile/me")
        public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) return ResponseEntity.status(401).build();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

            Faculty faculty = facultyRepository.findById(user.getUserId()).orElseThrow();
            List<SubjectAllocation> allocations = allocationRepository.findByFacultyId(user.getUserId());

            List<String> subjects = allocations.stream()
                    .map(a -> a.getSubject().getName() + " (" + a.getSubject().getAcademicYear() + ")")
                    .collect(Collectors.toList());

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("firstName", faculty.getFirstName());
            response.put("lastName", faculty.getLastName());
            response.put("email", user.getEmail());
            response.put("dob", faculty.getDob());
            response.put("designation", faculty.getDesignation());
            response.put("department", faculty.getDepartment());
            response.put("qualification", faculty.getQualification());
            response.put("joiningDate", faculty.getJoiningDate());
            response.put("phoneNumber", faculty.getPhoneNumber());
            response.put("coaRegistrationNo", faculty.getCoaRegistrationNo());
            response.put("coaValidFrom", faculty.getCoaValidFrom());
            response.put("coaValidTill", faculty.getCoaValidTill());
            response.put("aadharNo", faculty.getAadharNo());
            response.put("panCardNo", faculty.getPanCardNo());
            response.put("subjects", subjects);

            // Professional Development summary
            List<ProfessionalDevelopment> pdEntries = pdRepository.findByFacultyIdOrderByStartDateDesc(user.getUserId());
            List<Map<String, Object>> pdSummary = pdEntries.stream().map(pd -> {
                Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", pd.getId());
                m.put("title", pd.getTitle());
                m.put("type", pd.getType().name());
                m.put("organization", pd.getOrganization());
                m.put("startDate", pd.getStartDate());
                m.put("endDate", pd.getEndDate());
                return m;
            }).collect(Collectors.toList());
            response.put("professionalDevelopment", pdSummary);

            return ResponseEntity.ok(response);
        }

    @PostMapping("/marks/batch")
            public ResponseEntity<?> saveBatchMarks(@RequestBody List<com.sssms.portal.dto.request.AcademicMarksRequest> requests) {
                gradingService.saveBatchMarks(requests);
                return ResponseEntity.ok("Marks Saved Successfully");
    }

    @GetMapping("/marks/{allocationId}/status")
    public ResponseEntity<?> getGradedExamTypes(@PathVariable Long allocationId) {
        return ResponseEntity.ok(gradingService.getGradedExamTypes(allocationId));
    }

    @GetMapping("/marks/{allocationId}")
    public ResponseEntity<?> getMarksForExamType(
            @PathVariable Long allocationId,
            @RequestParam String examType) {
        return ResponseEntity.ok(gradingService.getMarksForExamType(allocationId,
                com.sssms.portal.entity.ExamType.valueOf(examType)));
    }

    @GetMapping("/report-card/{studentId}")
    public ResponseEntity<?> getStudentReportCard(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long studentId) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        User facultyUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));

        // Verify faculty teaches this student
        List<SubjectAllocation> facultyAllocations = allocationRepository.findByFacultyId(facultyUser.getUserId());
        boolean isTeaching = facultyAllocations.stream().anyMatch(allocation -> {
            if (allocation.getSubject().getAcademicYear() == student.getAcademicYear()) return true;
            return student.getExtraCourses().contains(allocation);
        });

        if (!isTeaching) {
            return ResponseEntity.status(403).body("You are not authorized to view this student's report card.");
        }

        return ResponseEntity.ok(gradingService.generateReportCard(studentId));
    }

    // ==================== PROFESSIONAL DEVELOPMENT ====================

    @GetMapping("/professional-development")
    public ResponseEntity<?> getMyPD(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        List<ProfessionalDevelopment> entries = pdRepository.findByFacultyIdOrderByStartDateDesc(user.getUserId());
        return ResponseEntity.ok(entries.stream().map(this::mapPD).collect(Collectors.toList()));
    }

    @PostMapping("/professional-development")
    public ResponseEntity<?> addMyPD(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Faculty faculty = facultyRepository.findById(user.getUserId()).orElseThrow();

        ProfessionalDevelopment pd = ProfessionalDevelopment.builder()
                .faculty(faculty)
                .title(payload.get("title"))
                .type(ProfessionalDevelopment.PDType.valueOf(payload.get("type")))
                .organization(payload.get("organization"))
                .startDate(payload.get("startDate") != null && !payload.get("startDate").isEmpty() ? LocalDate.parse(payload.get("startDate")) : null)
                .endDate(payload.get("endDate") != null && !payload.get("endDate").isEmpty() ? LocalDate.parse(payload.get("endDate")) : null)
                .description(payload.get("description"))
                .addedBy(userDetails.getUsername())
                .build();
        pdRepository.save(pd);
        return ResponseEntity.ok("Entry added successfully");
    }

    @DeleteMapping("/professional-development/{id}")
    public ResponseEntity<?> deleteMyPD(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        ProfessionalDevelopment pd = pdRepository.findById(id).orElseThrow();
        if (!pd.getFaculty().getId().equals(user.getUserId())) {
            return ResponseEntity.status(403).body("Cannot delete another faculty's entry");
        }
        pdRepository.deleteById(id);
        return ResponseEntity.ok("Entry deleted");
    }

    private Map<String, Object> mapPD(ProfessionalDevelopment pd) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", pd.getId());
        map.put("title", pd.getTitle());
        map.put("type", pd.getType().name());
        map.put("organization", pd.getOrganization());
        map.put("startDate", pd.getStartDate());
        map.put("endDate", pd.getEndDate());
        map.put("description", pd.getDescription());
        map.put("addedBy", pd.getAddedBy());
        map.put("createdAt", pd.getCreatedAt());
        return map;
    }
}