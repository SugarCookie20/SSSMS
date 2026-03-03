package com.sssms.portal.dto.request;

import com.sssms.portal.entity.ExamType;
import lombok.Data;
import java.util.List;

@Data
public class AssessmentRequest {
    private Long allocationId;
    private String title;
    private ExamType type;
    private int maxMarks;
    private List<StudentMarkEntry> marks;

    @Data
    public static class StudentMarkEntry {
        private Long studentId;
        private double marks;
    }
}