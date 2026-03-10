package com.sssms.portal.controller;

import com.sssms.portal.dto.request.AllocationRequest;
import com.sssms.portal.dto.request.FacultyEnrollmentRequest;
import com.sssms.portal.dto.request.StudentEnrollmentRequest;
import com.sssms.portal.entity.AcademicYear;
import com.sssms.portal.entity.Faculty;
import com.sssms.portal.entity.ProfessionalDevelopment;
import com.sssms.portal.entity.Student;
import com.sssms.portal.entity.Subject;
import com.sssms.portal.entity.SubjectAllocation;
import com.sssms.portal.repository.FacultyRepository;
import com.sssms.portal.repository.ProfessionalDevelopmentRepository;
import com.sssms.portal.repository.StudentRepository;
import com.sssms.portal.repository.SubjectAllocationRepository;
import com.sssms.portal.repository.SubjectRepository;
import com.sssms.portal.service.AdminService;
import com.sssms.portal.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.sssms.portal.repository.UserRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    private final AdminService adminService;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final ProfessionalDevelopmentRepository pdRepository;
    private final com.sssms.portal.service.StudentService studentService;
    private final com.sssms.portal.service.GradingService gradingService;
    private final com.sssms.portal.service.GPAService gpaService;

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        subjectRepository.save(subject);
        return ResponseEntity.ok("Subject Created");
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping("/enroll-student")
    public ResponseEntity<?> enrollStudent(@RequestBody StudentEnrollmentRequest request) {
        try {
            String result = adminService.enrollStudent(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/enroll-faculty")
    public ResponseEntity<?> enrollFaculty(@RequestBody FacultyEnrollmentRequest request) {
        try {
            String result = adminService.enrollFaculty(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/upload-results")
    public ResponseEntity<String> uploadResults(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminService.processResultLedger(file));
    }

    @GetMapping("/faculty/{facultyId}/allocations")
    public ResponseEntity<?> getFacultyAllocations(@PathVariable Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyAllocations(facultyId));
    }

    @DeleteMapping("/allocation/{id}")
    public ResponseEntity<?> removeAllocation(@PathVariable Long id) {
        adminService.removeAllocation(id);
        return ResponseEntity.ok("Allocation removed successfully");
    }

    @GetMapping("/faculty/all")
    public ResponseEntity<List<Map<String, Object>>> getAllFaculty() {
        return ResponseEntity.ok(adminService.getAllFaculty());
    }

    @GetMapping("/years")
    public ResponseEntity<List<AcademicYear>> getAllYears() {
        return ResponseEntity.ok(Arrays.asList(AcademicYear.values()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String year) {
        List<Student> allStudents = studentRepository.findAll();
        if (year != null && !year.isEmpty()) {
            try {
                AcademicYear yearEnum = AcademicYear.valueOf(year);
                allStudents = allStudents.stream()
                        .filter(s -> s.getAcademicYear() == yearEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) { }
        }
        allStudents.sort(Comparator.comparing(Student::getFirstName));
        return ResponseEntity.ok(allStudents);
    }

    @PutMapping("/student/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody StudentEnrollmentRequest request) {
        Student student = studentRepository.findById(id).orElseThrow();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        if (request.getAcademicYear() != null) {
            student.setAcademicYear(request.getAcademicYear());
        }
        studentRepository.save(student);
        return ResponseEntity.ok("Student Updated");
    }

    @PostMapping("/allocate-subject")
    public ResponseEntity<String> allocateSubject(@RequestBody AllocationRequest request) {
        return ResponseEntity.ok(adminService.allocateSubject(request));
    }

    @GetMapping("/allocations/all")
    public ResponseEntity<List<Map<String, Object>>> getAllAllocations() {
        List<SubjectAllocation> list = allocationRepository.findAll();
        List<Map<String, Object>> response = list.stream().map(a -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", a.getId());
            map.put("subjectName", a.getSubject().getName());
            map.put("subjectCode", a.getSubject().getCode());
            if (a.getFaculty() != null) {
                map.put("facultyName", a.getFaculty().getFirstName() + " " + a.getFaculty().getLastName());
            } else {
                map.put("facultyName", "Unassigned");
            }
            map.put("year", a.getSubject().getAcademicYear() != null ? a.getSubject().getAcademicYear().toString() : "N/A");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/student/{studentId}/course/{allocationId}")
    public ResponseEntity<?> addCourseToStudent(@PathVariable Long studentId, @PathVariable Long allocationId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        student.getExtraCourses().add(allocation);
        studentRepository.save(student);
        return ResponseEntity.ok("Course Assigned");
    }

    @DeleteMapping("/student/{studentId}/course/{allocationId}")
    public ResponseEntity<?> removeCourseFromStudent(@PathVariable Long studentId, @PathVariable Long allocationId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        student.getExtraCourses().remove(allocation);
        studentRepository.save(student);
        return ResponseEntity.ok("Course Removed");
    }

    @DeleteMapping("/student/{id}")
        public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
            adminService.deleteStudent(id);
            return ResponseEntity.ok("Student Un-enrolled Successfully");
        }

    @DeleteMapping("/faculty/{id}")
        public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("Faculty Un-enrolled Successfully");
        }

    @DeleteMapping("/subject/{id}")
        public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
            subjectRepository.deleteById(id);
            return ResponseEntity.ok("Subject Deleted Successfully");
        }

    @GetMapping("/student/{id}/profile")
        public ResponseEntity<?> getStudentProfile(@PathVariable Long id) {
            return ResponseEntity.ok(studentService.getProfile(id));
        }

    @GetMapping("/faculty/{id}/profile")
        public ResponseEntity<?> getFacultyProfile(@PathVariable Long id) {
            return ResponseEntity.ok(adminService.getFacultyProfile(id));
     }

    @GetMapping("/report-card/{studentId}")
    public ResponseEntity<?> getStudentReportCard(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradingService.generateReportCard(studentId));
    }

    // ==================== PROFESSIONAL DEVELOPMENT ====================

    @GetMapping("/faculty/{facultyId}/pd")
    public ResponseEntity<?> getFacultyPD(@PathVariable Long facultyId) {
        List<ProfessionalDevelopment> entries = pdRepository.findByFacultyIdOrderByStartDateDesc(facultyId);
        return ResponseEntity.ok(entries.stream().map(this::mapPD).collect(Collectors.toList()));
    }

    @PostMapping("/faculty/{facultyId}/pd")
    public ResponseEntity<?> addFacultyPD(
            @PathVariable Long facultyId,
            @RequestBody Map<String, String> payload) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        ProfessionalDevelopment pd = ProfessionalDevelopment.builder()
                .faculty(faculty)
                .title(payload.get("title"))
                .type(ProfessionalDevelopment.PDType.valueOf(payload.get("type")))
                .organization(payload.get("organization"))
                .startDate(payload.get("startDate") != null && !payload.get("startDate").isEmpty() ? LocalDate.parse(payload.get("startDate")) : null)
                .endDate(payload.get("endDate") != null && !payload.get("endDate").isEmpty() ? LocalDate.parse(payload.get("endDate")) : null)
                .description(payload.get("description"))
                .addedBy("admin")
                .build();
        pdRepository.save(pd);
        return ResponseEntity.ok("Entry added for faculty");
    }

    @DeleteMapping("/pd/{id}")
    public ResponseEntity<?> deletePD(@PathVariable Long id) {
        pdRepository.deleteById(id);
        return ResponseEntity.ok("Entry deleted");
    }

    private Map<String, Object> mapPD(ProfessionalDevelopment pd) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", pd.getId());
        map.put("title", pd.getTitle());
        map.put("type", pd.getType().name());
        map.put("organization", pd.getOrganization());
        map.put("startDate", pd.getStartDate());
        map.put("endDate", pd.getEndDate());
        map.put("description", pd.getDescription());
        map.put("addedBy", pd.getAddedBy());
        map.put("createdAt", pd.getCreatedAt());
        map.put("facultyName", pd.getFaculty().getFirstName() + " " + pd.getFaculty().getLastName());
        return map;
    }

    // ==================== GPA LEDGER ====================

    @GetMapping("/gpa/students")
    public ResponseEntity<?> getStudentsForGPA(
            @RequestParam(required = false) String year,
            @RequestParam(required = false) Integer semester) {
        List<Student> students = studentRepository.findAll();

        // Filter by year if provided
        if (year != null && !year.isEmpty()) {
            try {
                AcademicYear yearEnum = AcademicYear.valueOf(year);
                students = students.stream()
                        .filter(s -> s.getAcademicYear() == yearEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) { }
        }

        students.sort(Comparator.comparing(Student::getFirstName));

        // Get SGPA for each student for the selected semester
        List<Map<String, Object>> response = students.stream().map(student -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", student.getId());
            map.put("prn", student.getPrn());
            map.put("firstName", student.getFirstName());
            map.put("lastName", student.getLastName());
            map.put("academicYear", student.getAcademicYear() != null ? student.getAcademicYear().toString() : "N/A");

            // Get existing result for this semester
            if (semester != null) {
                gpaService.getStudentResults(student.getId()).stream()
                        .filter(r -> r.getSemester().equals(semester))
                        .findFirst()
                        .ifPresent(result -> {
                            map.put("sgpa", result.getSgpa());
                            map.put("cgpa", result.getCgpa());
                            map.put("status", result.getStatus());
                        });
            }

            // Get overall CGPA
            Double overallCgpa = gpaService.calculateOverallCGPA(student.getId());
            map.put("overallCgpa", overallCgpa);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/gpa/enter")
    public ResponseEntity<?> enterSGPA(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        Integer semester = Integer.valueOf(payload.get("semester").toString());
        Double sgpa = Double.valueOf(payload.get("sgpa").toString());
        String status = payload.get("status").toString();

        gpaService.enterSGPA(studentId, semester, sgpa, status);

        return ResponseEntity.ok("SGPA entered successfully");
    }

    @PostMapping("/gpa/batch")
    public ResponseEntity<?> enterBatchSGPA(@RequestBody List<Map<String, Object>> batch) {
        for (Map<String, Object> entry : batch) {
            Long studentId = Long.valueOf(entry.get("studentId").toString());
            Integer semester = Integer.valueOf(entry.get("semester").toString());
            Double sgpa = Double.valueOf(entry.get("sgpa").toString());
            String status = entry.get("status").toString();

            gpaService.enterSGPA(studentId, semester, sgpa, status);
        }

        return ResponseEntity.ok("Batch SGPA entered successfully");
    }
}

