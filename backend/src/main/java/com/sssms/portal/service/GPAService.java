package com.sssms.portal.service;

import com.sssms.portal.entity.AcademicYear;
import com.sssms.portal.entity.ExamResult;
import com.sssms.portal.entity.Student;
import com.sssms.portal.repository.ExamResultRepository;
import com.sssms.portal.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GPAService {

    private final ExamResultRepository examResultRepository;
    private final StudentRepository studentRepository;

    private static final Map<AcademicYear, Integer> MAX_SEMESTER = Map.of(
        AcademicYear.FIRST_YEAR,  2,
        AcademicYear.SECOND_YEAR, 4,
        AcademicYear.THIRD_YEAR,  6,
        AcademicYear.FOURTH_YEAR, 8,
        AcademicYear.FIFTH_YEAR,  10
    );

    @Transactional
    public ExamResult enterSGPA(Long studentId, Integer semester, Double sgpa, String status) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Guard: reject semesters beyond the student's current academic year
        AcademicYear academicYear = student.getAcademicYear();
        if (academicYear != null) {
            int maxAllowed = MAX_SEMESTER.getOrDefault(academicYear, 10);
            if (semester > maxAllowed) {
                throw new RuntimeException(
                    "Cannot enter GPA for Semester " + semester +
                    " — student is in " + academicYear.name().replace("_", " ") +
                    " (max allowed: Semester " + maxAllowed + ")"
                );
            }
        }

        // Calculate CGPA (average of all SGPAs up to this semester)
        List<ExamResult> previousResults = examResultRepository.findByStudentIdOrderBySemesterAsc(studentId);

        double totalSgpa = sgpa;
        int semesterCount = 1;

        for (ExamResult result : previousResults) {
            if (result.getSemester() < semester) {
                totalSgpa += result.getSgpa();
                semesterCount++;
            }
        }

        double cgpa = totalSgpa / semesterCount;

        // Check if result already exists for this semester
        Optional<ExamResult> existingResult = examResultRepository.findByStudentIdAndSemester(studentId, semester);

        ExamResult result;
        if (existingResult.isPresent()) {
            // Update existing
            result = existingResult.get();
            result.setSgpa(sgpa);
            result.setCgpa(cgpa);
            result.setStatus(status);
            result.setResultDate(LocalDate.now());
        } else {
            // Create new
            result = ExamResult.builder()
                    .student(student)
                    .semester(semester)
                    .sgpa(sgpa)
                    .cgpa(cgpa)
                    .status(status)
                    .resultDate(LocalDate.now())
                    .examSession("Semester " + semester + " - " + LocalDate.now().getYear())
                    .build();
        }

        examResultRepository.save(result);

        // Recalculate CGPA for all subsequent semesters
        recalculateCGPAForSubsequentSemesters(studentId, semester);

        return result;
    }

    @Transactional
    public void recalculateCGPAForSubsequentSemesters(Long studentId, Integer fromSemester) {
        List<ExamResult> allResults = examResultRepository.findByStudentIdOrderBySemesterAsc(studentId);

        double cumulativeSgpa = 0;
        int count = 0;

        for (ExamResult result : allResults) {
            cumulativeSgpa += result.getSgpa();
            count++;

            if (result.getSemester() >= fromSemester) {
                double newCgpa = cumulativeSgpa / count;
                result.setCgpa(newCgpa);
                examResultRepository.save(result);
            }
        }
    }

    public List<ExamResult> getStudentResults(Long studentId) {
        return examResultRepository.findByStudentIdOrderBySemesterAsc(studentId);
    }

    public Double calculateOverallCGPA(Long studentId) {
        List<ExamResult> results = examResultRepository.findByStudentIdOrderBySemesterAsc(studentId);

        if (results.isEmpty()) {
            return 0.0;
        }

        // Return the CGPA of the latest semester (which is cumulative)
        return results.get(results.size() - 1).getCgpa();
    }
}

