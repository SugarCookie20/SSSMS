package com.sssms.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notices")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;
    private String attachment;

    private LocalDateTime date;

    private LocalDateTime expiresAt; // null means forever

    @Enumerated(EnumType.STRING)
    private TargetRole targetRole;

    @ManyToOne
    @JoinColumn(name = "posted_by_id")
    private User postedBy;
}