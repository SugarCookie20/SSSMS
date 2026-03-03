package com.sssms.portal.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import com.sssms.portal.entity.AdmissionCategory;

@Data
@Builder
public class StudentProfileResponse {

    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String prn;
    private String department;
    private String currentYear;
    private String phoneNumber;
    private String parentPhoneNumber;
    private String address;
    private LocalDate dob;

    private String coaEnrollmentNo;
    private String grNo;
    private String aadharNo;
    private String abcId;
    private String bloodGroup;
    private AdmissionCategory admissionCategory;

    private double overallAttendance;
    private double cgpa;
}