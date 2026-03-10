package com.sssms.portal.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FacultyEnrollmentRequest {
    private String email;
    private String password;

    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dob;
    private String designation;
    private String department;
    private String qualification;
    private String phoneNumber;
    private LocalDate joiningDate;
    private String coaRegistrationNo;
    private java.time.LocalDate coaValidFrom;
    private java.time.LocalDate coaValidTill;
    private String aadharNo;
    private String panCardNo;
}