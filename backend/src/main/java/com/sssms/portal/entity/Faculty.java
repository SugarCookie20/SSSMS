package com.sssms.portal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "faculty_profiles")
public class Faculty {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String firstName;
    private String middleName;
    private String lastName;

    private LocalDate dob;

    private String designation;
    private String department;
    private String qualification;
    private String phoneNumber;
    private LocalDate joiningDate;
    private String timetablePdf;
    private String coaRegistrationNo;
    private java.time.LocalDate coaValidFrom;
    private java.time.LocalDate coaValidTill;
    private String aadharNo;
    private String panCardNo;
}