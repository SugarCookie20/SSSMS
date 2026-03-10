//check

package com.sssms.portal.service;

import com.sssms.portal.dto.request.AcademicMarksRequest;
import com.sssms.portal.entity.*;
import com.sssms.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradingService {

    private final AcademicMarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final SubjectAllocationRepository subjectAllocationRepository;

    @Transactional
    public void saveBatchMarks(List<AcademicMarksRequest> requests) {
        for (AcademicMarksRequest req : requests) {
            Student student = studentRepository.findById(req.getStudentId()).orElseThrow();

            SubjectAllocation allocation = allocationRepository.findById(req.getAllocationId()).orElseThrow();
            Subject subject = allocation.getSubject();

            // Upsert: update if exists, insert if not
            Optional<AcademicMarks> existing = marksRepository
                    .findByStudentIdAndSubjectIdAndExamType(student.getId(), subject.getId(), req.getExamType());

            if (existing.isPresent()) {
                AcademicMarks mark = existing.get();
                mark.setMarksObtained(req.getMarks());
                mark.setMaxMarks(req.getMaxMarks());
                marksRepository.save(mark);
            } else {
                AcademicMarks mark = AcademicMarks.builder()
                        .student(student)
                        .subject(subject)
                        .examType(req.getExamType())
                        .marksObtained(req.getMarks())
                        .maxMarks(req.getMaxMarks())
                        .build();
                marksRepository.save(mark);
            }
        }
    }

    /**
     * Returns list of ExamTypes already graded for a given allocation's subject.
     */
    public List<String> getGradedExamTypes(Long allocationId) {
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        Subject subject = allocation.getSubject();

        List<AcademicMarks> allMarks = marksRepository.findBySubjectId(subject.getId());
        return allMarks.stream()
                .map(m -> m.getExamType().name())
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Returns existing marks for a given allocation + examType, so the frontend can pre-fill for editing.
     */
    public List<Map<String, Object>> getMarksForExamType(Long allocationId, ExamType examType) {
        SubjectAllocation allocation = allocationRepository.findById(allocationId).orElseThrow();
        Subject subject = allocation.getSubject();

        List<AcademicMarks> marks = marksRepository.findBySubjectIdAndExamType(subject.getId(), examType);
        return marks.stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", m.getStudent().getId());
            map.put("marksObtained", m.getMarksObtained());
            map.put("maxMarks", m.getMaxMarks());
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> generateReportCard(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();

        List<AcademicMarks> allMarks = marksRepository.findByStudentId(studentId);

        Map<Subject, List<AcademicMarks>> marksBySubject = allMarks.stream()
                .collect(Collectors.groupingBy(AcademicMarks::getSubject));

        List<Map<String, Object>> reportCard = new ArrayList<>();

        for (Map.Entry<Subject, List<AcademicMarks>> entry : marksBySubject.entrySet()) {
            Subject subject = entry.getKey();
            List<AcademicMarks> subjectMarks = entry.getValue();

            Map<String, Object> subjectReport = calculateFinalResult(subjectMarks);
            subjectReport.put("subjectName", subject.getName());
            subjectReport.put("subjectCode", subject.getCode());

            reportCard.add(subjectReport);
        }
        return reportCard;
    }

    private Map<String, Object> calculateFinalResult(List<AcademicMarks> marks) {
        // 1. Unit Tests: Best of 2 (Sum, not average)
        List<Double> unitTests = marks.stream()
                .filter(m -> m.getExamType().isUnitTest())
                .map(AcademicMarks::getMarksObtained)
                .sorted(Collections.reverseOrder())
                .collect(Collectors.toList());

        double utBestOf2 = 0;
        if (unitTests.size() >= 2) {
            utBestOf2 = unitTests.get(0) + unitTests.get(1); // Sum of Best 2
        } else if (unitTests.size() == 1) {
            utBestOf2 = unitTests.get(0);
        }

        // 2. ICA (Internal Continuous Assessment): Assignments + Jury
        double icaTotal = marks.stream()
                .filter(m -> m.getExamType() == ExamType.ASSIGNMENT || m.getExamType() == ExamType.JURY)
                .mapToDouble(AcademicMarks::getMarksObtained)
                .sum();

        // 3. Final Internal Mark = Best of 2 UTs + ICA
        double finalInternalMark = utBestOf2 + icaTotal;

        // 4. External Assessment - Theory
        double eseTheory = marks.stream()
                .filter(m -> m.getExamType() == ExamType.THEORY_ESE)
                .mapToDouble(AcademicMarks::getMarksObtained)
                .sum();

        // 5. External Assessment - Practical
        double esePractical = marks.stream()
                .filter(m -> m.getExamType() == ExamType.PRACTICAL_ESE)
                .mapToDouble(AcademicMarks::getMarksObtained)
                .sum();

        // 6. External Assessment - Sessional/Studio
        double eseSessional = marks.stream()
                .filter(m -> m.getExamType() == ExamType.SESSIONAL_ESE)
                .mapToDouble(AcademicMarks::getMarksObtained)
                .sum();

        // 7. Total External
        double totalExternal = eseTheory + esePractical + eseSessional;

        // 8. Grand Total
        double grandTotal = finalInternalMark + totalExternal;

        // Build Response
        Map<String, Object> result = new HashMap<>();

        // Internal Breakdown
        result.put("utBestOf2", utBestOf2);
        result.put("ica", icaTotal);
        result.put("internalMarks", finalInternalMark);

        // External Breakdown
        result.put("theoryMarks", eseTheory);
        result.put("practicalMarks", esePractical);
        result.put("sessionalMarks", eseSessional);
        result.put("externalMarks", totalExternal);

        // Total
        result.put("total", grandTotal);

        return result;
    }
}