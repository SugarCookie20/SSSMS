//check

package com.sssms.portal.repository;

import com.sssms.portal.entity.AcademicMarks;
import com.sssms.portal.entity.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AcademicMarksRepository extends JpaRepository<AcademicMarks, Long> {
    List<AcademicMarks> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<AcademicMarks> findByStudentId(Long studentId);
    List<AcademicMarks> findBySubjectIdAndExamType(Long subjectId, ExamType examType);
    Optional<AcademicMarks> findByStudentIdAndSubjectIdAndExamType(Long studentId, Long subjectId, ExamType examType);
    List<AcademicMarks> findBySubjectId(Long subjectId);
}