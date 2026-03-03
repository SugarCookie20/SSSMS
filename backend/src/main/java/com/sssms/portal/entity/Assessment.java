package com.sssms.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "assessments")
public class Assessment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title;
    @Enumerated(EnumType.STRING) private ExamType type;
    private int maxMarks;
    private LocalDate date;
    @ManyToOne @JoinColumn(name = "allocation_id") private SubjectAllocation allocation;
}