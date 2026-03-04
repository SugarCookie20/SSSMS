package com.sssms.portal.service;

import com.sssms.portal.dto.AttendanceReportDTO;
import com.sssms.portal.dto.request.AttendanceRequest;
import com.sssms.portal.dto.request.AssessmentRequest;

import com.sssms.portal.entity.*;

import com.sssms.portal.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final SubjectAllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentMarkRepository studentMarkRepository;

    public List<Student> getStudentsForAllocation(Long allocationId) {
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        AcademicYear year = allocation.getSubject().getAcademicYear();

        return studentRepository.findAll().stream()
                .filter(s -> s.getAcademicYear() == year)
                .collect(Collectors.toList());
    }

    @Transactional
    public String markAttendance(AttendanceRequest request) {
        SubjectAllocation allocation = allocationRepository.findById(request.getAllocationId())
                .orElseThrow(() -> new RuntimeException("Invalid Allocation"));

        AttendanceSession session = AttendanceSession.builder()
                .allocation(allocation)
                .date(request.getDate())
                .build();

        sessionRepository.save(session);

        List<AttendanceRecord> records = request.getStudents().stream().map(s -> {
            Student student = studentRepository.findById(s.getStudentId()).orElseThrow();
            return AttendanceRecord.builder()
                    .session(session)
                    .student(student)
                    .status(s.getStatus())
                    .build();
        }).collect(Collectors.toList());

        recordRepository.saveAll(records);
        return "Attendance Marked Successfully";
    }

    public AttendanceReportDTO getAttendanceReport(Long allocationId, LocalDate startDate, LocalDate endDate) {
        SubjectAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));

        // 1. Fetch Sessions
        List<AttendanceSession> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getAllocation().getId().equals(allocationId))
                .filter(s -> {
                    if (startDate == null || endDate == null) return true;
                    return !s.getDate().isBefore(startDate) && !s.getDate().isAfter(endDate);
                })
                .collect(Collectors.toList());

        int totalSessions = sessions.size();
        List<AttendanceReportDTO.StudentStat> stats = new ArrayList<>();

        // 2. Get Students
        List<Student> students = getStudentsForAllocation(allocationId);

        // 3. Calculate Stats
        for (Student s : students) {
            long attended = 0;
            for (AttendanceSession session : sessions) {
                boolean isPresent = recordRepository.findAll().stream()
                        .anyMatch(r -> r.getSession().getId().equals(session.getId())
                                    && r.getStudent().getId().equals(s.getId())
                                    && r.getStatus() == AttendanceStatus.PRESENT);
                if (isPresent) attended++;
            }

            double percent = (totalSessions == 0) ? 0 : ((double) attended / totalSessions) * 100;

            stats.add(AttendanceReportDTO.StudentStat.builder()
                    .studentName(s.getFirstName() + " " + s.getLastName())
                    .prn(s.getPrn())
                    .sessionsAttended((int) attended)
                    .percentage(Math.round(percent * 10.0) / 10.0)
                    .build());
        }

        // Updated Class Name Logic
        String className = allocation.getSubject().getAcademicYear().toString();

        return AttendanceReportDTO.builder()
                .subjectName(allocation.getSubject().getName())
                .className(className)
                .totalSessionsHeld(totalSessions)
                .range((startDate == null) ? "Overall" : startDate + " to " + endDate)
                .studentStats(stats)
                .build();
    }

    @Transactional
    public String createAssessment(com.sssms.portal.dto.request.AssessmentRequest request) {
        SubjectAllocation allocation = allocationRepository.findById(request.getAllocationId()).orElseThrow();

        Assessment assessment = Assessment.builder()
                .title(request.getTitle())
                .type(request.getType())
                .maxMarks(request.getMaxMarks())
                .allocation(allocation)
                .date(LocalDate.now())
                .build();

        assessmentRepository.save(assessment);

        List<StudentMark> marksList = request.getMarks().stream().map(m -> {
            Student s = studentRepository.findById(m.getStudentId()).orElseThrow();
            return StudentMark.builder()
                    .assessment(assessment)
                    .student(s)
                    .marksObtained(m.getMarks())
                    .build();
        }).collect(Collectors.toList());

        studentMarkRepository.saveAll(marksList);
        return "Assessment Created";
    }

    public List<Map<String, Object>> getSessionsForAllocation(Long allocationId) {
        List<AttendanceSession> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getAllocation().getId().equals(allocationId))
                .sorted((a, b) -> b.getDate().compareTo(a.getDate())) // newest first
                .collect(Collectors.toList());

        return sessions.stream().map(session -> {
            Map<String, Object> map = new HashMap<>();
            map.put("sessionId", session.getId());
            map.put("date", session.getDate());

            List<AttendanceRecord> records = recordRepository.findAll().stream()
                    .filter(r -> r.getSession().getId().equals(session.getId()))
                    .collect(Collectors.toList());

            long presentCount = records.stream()
                    .filter(r -> r.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            map.put("totalStudents", records.size());
            map.put("presentCount", presentCount);
            map.put("absentCount", records.size() - presentCount);
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getAttendanceForDate(Long allocationId, LocalDate date) {
        Map<String, Object> result = new HashMap<>();

        List<AttendanceSession> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getAllocation().getId().equals(allocationId) && s.getDate().equals(date))
                .collect(Collectors.toList());

        if (sessions.isEmpty()) {
            result.put("exists", false);
            return result;
        }

        AttendanceSession session = sessions.get(0);
        result.put("exists", true);
        result.put("sessionId", session.getId());

        List<Map<String, Object>> records = recordRepository.findAll().stream()
                .filter(r -> r.getSession().getId().equals(session.getId()))
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("studentId", r.getStudent().getId());
                    m.put("status", r.getStatus().name());
                    return m;
                }).collect(Collectors.toList());

        result.put("records", records);
        return result;
    }

    @Transactional
    public String updateAttendance(Long sessionId, AttendanceRequest request) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Delete old records
        List<AttendanceRecord> oldRecords = recordRepository.findAll().stream()
                .filter(r -> r.getSession().getId().equals(sessionId))
                .collect(Collectors.toList());
        recordRepository.deleteAll(oldRecords);

        // Insert new records
        List<AttendanceRecord> newRecords = request.getStudents().stream().map(s -> {
            Student student = studentRepository.findById(s.getStudentId()).orElseThrow();
            return AttendanceRecord.builder()
                    .session(session)
                    .student(student)
                    .status(s.getStatus())
                    .build();
        }).collect(Collectors.toList());

        recordRepository.saveAll(newRecords);
        return "Attendance Updated Successfully";
    }

    @Transactional
    public String deleteAttendanceSession(Long sessionId) {
        List<AttendanceRecord> records = recordRepository.findAll().stream()
                .filter(r -> r.getSession().getId().equals(sessionId))
                .collect(Collectors.toList());
        recordRepository.deleteAll(records);
        sessionRepository.deleteById(sessionId);
        return "Attendance Session Deleted";
    }

    public ByteArrayInputStream generateAttendanceCSV(Long allocationId, LocalDate startDate, LocalDate endDate) {
            AttendanceReportDTO report = getAttendanceReport(allocationId, startDate, endDate);

            try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                 PrintWriter writer = new PrintWriter(out)) {

                // Header
                writer.println("Subject," + report.getSubjectName());
                writer.println("Class," + report.getClassName());
                writer.println("Range," + report.getRange());
                writer.println("Total Sessions," + report.getTotalSessionsHeld());
                writer.println(""); // Empty Line

                // Columns
                writer.println("PRN,Student Name,Attended,Total,Percentage");

                // Data Rows
                for (AttendanceReportDTO.StudentStat s : report.getStudentStats()) {
                    writer.printf("%s,%s,%d,%d,%.1f%%%n",
                            s.getPrn(),
                            s.getStudentName(),
                            s.getSessionsAttended(),
                            report.getTotalSessionsHeld(),
                            s.getPercentage());
                }

                writer.flush();
                return new ByteArrayInputStream(out.toByteArray());

            } catch (Exception e) {
                throw new RuntimeException("Failed to generate CSV data: " + e.getMessage());
            }
        }

    public ByteArrayInputStream generateAttendancePDF(Long allocationId, LocalDate startDate, LocalDate endDate) {
        AttendanceReportDTO report = getAttendanceReport(allocationId, startDate, endDate);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(out)) {

            // Build an HTML string for a clean printable PDF (browser-rendered)
            StringBuilder html = new StringBuilder();
            html.append("<html><head><meta charset=\"UTF-8\"><style>");
            html.append("body { font-family: Arial, sans-serif; margin: 20px; }");
            html.append("h1 { color: #1a1a2e; font-size: 22px; margin-bottom: 4px; }");
            html.append("h2 { color: #555; font-size: 14px; font-weight: normal; margin-top: 0; }");
            html.append("table { width: 100%; border-collapse: collapse; margin-top: 20px; }");
            html.append("th { background: #f3f4f6; border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }");
            html.append("td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; }");
            html.append("tr:nth-child(even) { background: #f9fafb; }");
            html.append(".meta { margin: 10px 0; font-size: 13px; color: #555; }");
            html.append(".low { color: #dc2626; font-weight: bold; }");
            html.append("</style></head><body>");

            html.append("<h1>Attendance Report - ").append(report.getSubjectName()).append("</h1>");
            html.append("<h2>Class: ").append(report.getClassName()).append("</h2>");
            html.append("<div class='meta'>Period: ").append(report.getRange())
                .append(" &nbsp;|&nbsp; Total Sessions: ").append(report.getTotalSessionsHeld()).append("</div>");

            html.append("<table><thead><tr>");
            html.append("<th>#</th><th>PRN</th><th>Student Name</th><th>Attended</th><th>Total</th><th>%</th>");
            html.append("</tr></thead><tbody>");

            int i = 1;
            for (AttendanceReportDTO.StudentStat s : report.getStudentStats()) {
                String cls = s.getPercentage() < 75 ? " class='low'" : "";
                html.append("<tr><td>").append(i++).append("</td>");
                html.append("<td>").append(s.getPrn()).append("</td>");
                html.append("<td>").append(s.getStudentName()).append("</td>");
                html.append("<td>").append(s.getSessionsAttended()).append("</td>");
                html.append("<td>").append(report.getTotalSessionsHeld()).append("</td>");
                html.append("<td").append(cls).append(">").append(String.format("%.1f%%", s.getPercentage())).append("</td></tr>");
            }
            html.append("</tbody></table>");
            html.append("<div class='meta' style='margin-top:20px;'>Generated on: ").append(LocalDate.now()).append("</div>");
            html.append("</body></html>");

            writer.print(html.toString());
            writer.flush();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF data: " + e.getMessage());
        }
    }


}