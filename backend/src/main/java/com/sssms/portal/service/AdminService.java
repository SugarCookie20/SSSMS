package com.sssms.portal.service;

import com.sssms.portal.dto.request.AllocationRequest;
import com.sssms.portal.dto.request.FacultyEnrollmentRequest;
import com.sssms.portal.dto.request.StudentEnrollmentRequest;
import com.sssms.portal.entity.*;
import com.sssms.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubjectRepository subjectRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final FeeRepository feeRepository;

    private final ResultParserService parserService;
    private final FileStorageService fileStorageService;
    private final ExamResultRepository resultRepository;
    private final ProfessionalDevelopmentRepository pdRepository;

    @Transactional
    public String enrollStudent(StudentEnrollmentRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists. Please use a different email address.");
        }

        // Check if PRN already exists
        if (studentRepository.findByPrn(request.getPrn()).isPresent()) {
            throw new RuntimeException("PRN already exists. Please use a different PRN.");
        }

        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(newUser);

        Student newStudent = Student.builder()
                .user(savedUser)
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .prn(request.getPrn())
                .academicYear(request.getAcademicYear())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .dob(request.getDob())
                .coaEnrollmentNo(request.getCoaEnrollmentNo())
                .grNo(request.getGrNo())
                .aadharNo(request.getAadharNo())
                .abcId(request.getAbcId())
                .bloodGroup(request.getBloodGroup())
                .parentPhoneNumber(request.getParentPhoneNumber())
                .admissionCategory(request.getAdmissionCategory())
                .scholarshipStatus(ScholarshipStatus.NOT_APPLIED)
                .build();
        studentRepository.save(newStudent);

        feeRepository.save(FeeRecord.builder()
                .student(newStudent)
                .totalFee(150000.0)
                .paidAmount(0.0)
                .scholarshipAmount(0.0)
                .build());
        return "Student enrolled successfully with ID: " + savedUser.getUserId();
    }

    @Transactional
    public String enrollFaculty(FacultyEnrollmentRequest request) {
        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.FACULTY)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(newUser);

        Faculty newFaculty = Faculty.builder()
                .user(savedUser)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .qualification(request.getQualification())
                .phoneNumber(request.getPhoneNumber())
                .joiningDate(request.getJoiningDate())
                .coaRegistrationNo(request.getCoaRegistrationNo())
                .coaValidFrom(request.getCoaValidFrom())
                .coaValidTill(request.getCoaValidTill())
                .aadharNo(request.getAadharNo())
                .panCardNo(request.getPanCardNo())
                .build();
        facultyRepository.save(newFaculty);
        return "Faculty enrolled successfully";
    }

    public String allocateSubject(AllocationRequest request) {
        Faculty faculty = facultyRepository.findById(request.getFacultyId()).orElseThrow();
        Subject subject = subjectRepository.findById(request.getSubjectId()).orElseThrow();

        // Prevent Duplicate Allocation
        boolean exists = allocationRepository.findAll().stream()
            .anyMatch(a -> a.getFaculty().getId().equals(faculty.getId()) && a.getSubject().getId().equals(subject.getId()));

        if (exists) return "Subject already assigned to this faculty";

        SubjectAllocation allocation = SubjectAllocation.builder()
                .faculty(faculty)
                .subject(subject)
                .build();
        allocationRepository.save(allocation);
        return "Subject Assigned!";
    }

    public List<Map<String, Object>> getFacultyAllocations(Long facultyId) {
        List<SubjectAllocation> list = allocationRepository.findByFacultyId(facultyId);
        return list.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("subjectName", a.getSubject().getName());
            map.put("subjectCode", a.getSubject().getCode());
            if (a.getSubject().getAcademicYear() != null) {
                map.put("className", a.getSubject().getAcademicYear().toString());
            } else {
                map.put("className", "N/A");
            }
            return map;
        }).collect(Collectors.toList());
    }

    public void removeAllocation(Long id) {
        allocationRepository.deleteById(id);
    }

    public List<Map<String, Object>> getAllFaculty() {
        return facultyRepository.findAll().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("name", f.getFirstName() + " " + f.getLastName());
            map.put("email", f.getUser().getEmail());
            map.put("designation", f.getDesignation());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getFacultyProfile(Long userId) {
            Faculty faculty = facultyRepository.findById(userId).orElseThrow();

            List<SubjectAllocation> allocations = allocationRepository.findByFacultyId(userId);
            List<String> subjects = allocations.stream()
                    .map(a -> a.getSubject().getName() + " (" + a.getSubject().getAcademicYear() + ")")
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("firstName", faculty.getFirstName());
            response.put("lastName", faculty.getLastName());
            response.put("email", faculty.getUser().getEmail());
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
            List<ProfessionalDevelopment> pdEntries = pdRepository.findByFacultyIdOrderByStartDateDesc(userId);
            List<Map<String, Object>> pdSummary = pdEntries.stream().map(pd -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", pd.getId());
                m.put("title", pd.getTitle());
                m.put("type", pd.getType().name());
                m.put("organization", pd.getOrganization());
                m.put("startDate", pd.getStartDate());
                m.put("endDate", pd.getEndDate());
                return m;
            }).collect(Collectors.toList());
            response.put("professionalDevelopment", pdSummary);

            return response;
        }

    public String processResultLedger(MultipartFile file) { return "Results Processed"; }
    public List<Map<String, Object>> getAllAllocations() { return List.of(); }
}