package com.sssms.portal.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "year_metadata")
public class YearMetadata {

    @Id
    @Enumerated(EnumType.STRING)
    private AcademicYear id;

    private String timetablePdf;
    private String examSchedulePdf;
    private String collegeCalendarPdf;
    private String academicSchedulePdf;
}