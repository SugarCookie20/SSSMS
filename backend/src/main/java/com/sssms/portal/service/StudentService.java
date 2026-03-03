package com.sssms.portal.service;

import com.sssms.portal.dto.request.StudentAttendanceDTO;
import com.sssms.portal.dto.StudentProfileResponse;
import com.sssms.portal.entity.*;
import com.sssms.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final SubjectRepository subjectRepository; // Make sure this is final
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final ExamResultRepository examResultRepository;

    public StudentProfileResponse getProfile(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 1. Calculate Overall Attendance
        List<StudentAttendanceDTO> attendanceList = getMyAttendance(userId);
        double avgAttendance = attendanceList.isEmpty() ? 0.0 :
            attendanceList.stream().mapToDouble(StudentAttendanceDTO::getPercentage).average().orElse(0.0);

        // 2. Fetch Real CGPA
        List<ExamResult> results = examResultRepository.findByStudentId(userId);
        double cgpa = 0.0;
        if (!results.isEmpty()) {
            double totalSgpa = results.stream().mapToDouble(ExamResult::getSgpa).sum();
            cgpa = totalSgpa / results.size();
        }

        return StudentProfileResponse.builder()
                .firstName(student.getFirstName())
                .middleName(student.getMiddleName())
                .lastName(student.getLastName())
                .email(student.getUser().getEmail())
                .prn(student.getPrn())
                .department("Architecture")
                .currentYear(student.getAcademicYear().toString())
                .phoneNumber(student.getPhoneNumber())
                .parentPhoneNumber(student.getParentPhoneNumber())
                .address(student.getAddress())
                .dob(student.getDob())
                .coaEnrollmentNo(student.getCoaEnrollmentNo())
                .grNo(student.getGrNo())
                .aadharNo(student.getAadharNo())
                .abcId(student.getAbcId())
                .bloodGroup(student.getBloodGroup())
                .admissionCategory(student.getAdmissionCategory())
                .overallAttendance(Math.round(avgAttendance * 10.0) / 10.0)
                .cgpa(Math.round(cgpa * 100.0) / 100.0)
                .build();
    }

    public List<StudentAttendanceDTO> getMyAttendance(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        // 1. Get ALL Subjects for this Student's Year
        List<Subject> subjects = subjectRepository.findAll().stream()
                .filter(s -> s.getAcademicYear() == student.getAcademicYear())
                .collect(Collectors.toList());

        Map<String, StudentAttendanceDTO> subjectMap = new HashMap<>();

        // 2. Pre-fill Map with Subjects
        for (Subject s : subjects) {
            subjectMap.put(s.getCode(), StudentAttendanceDTO.builder()
                    .subjectName(s.getName())
                    .subjectCode(s.getCode())
                    .totalSessions(0)
                    .attendedSessions(0)
                    .percentage(0.0)
                    .build());
        }

        // 3. Find Allocations
        List<SubjectAllocation> allocations = allocationRepository.findAll().stream()
                .filter(a -> a.getSubject().getAcademicYear() == student.getAcademicYear())
                .collect(Collectors.toList());

        // Add Extra Courses
        if (student.getExtraCourses() != null) {
             allocations.addAll(student.getExtraCourses());
             for(SubjectAllocation sa : student.getExtraCourses()) {
                 if(!subjectMap.containsKey(sa.getSubject().getCode())) {
                     subjectMap.put(sa.getSubject().getCode(), StudentAttendanceDTO.builder()
                         .subjectName(sa.getSubject().getName())
                         .subjectCode(sa.getSubject().getCode())
                         .totalSessions(0).attendedSessions(0).percentage(0.0).build());
                 }
             }
        }

        // 4. Calculate Attendance from Allocations
        for (SubjectAllocation allocation : allocations) {
            String code = allocation.getSubject().getCode();

            long total = sessionRepository.findAll().stream()
                    .filter(s -> s.getAllocation().getId().equals(allocation.getId())).count();

            long attended = recordRepository.findAll().stream()
                    .filter(r -> r.getStudent().getId().equals(student.getId())
                            && r.getSession().getAllocation().getId().equals(allocation.getId())
                            && r.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            if (subjectMap.containsKey(code)) {
                StudentAttendanceDTO dto = subjectMap.get(code);
                dto.setTotalSessions(dto.getTotalSessions() + (int) total);
                dto.setAttendedSessions(dto.getAttendedSessions() + (int) attended);
            }
        }

        // 5. Calculate Percentages
        return subjectMap.values().stream().map(dto -> {
            double p = (dto.getTotalSessions() == 0) ? 0 : ((double) dto.getAttendedSessions() / dto.getTotalSessions()) * 100;
            dto.setPercentage(Math.round(p * 10.0) / 10.0);
            return dto;
        }).collect(Collectors.toList());
    }
}