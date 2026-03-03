package com.sssms.portal.entity;

public enum LogAction {

    // Auth
    LOGIN,
    LOGOUT,
    REGISTER,

    // Student
    STUDENT_ENROLLED,
    STUDENT_UPDATED,
    STUDENT_DELETED,
    STUDENT_PROFILE_VIEWED,

    // Faculty
    FACULTY_ENROLLED,
    FACULTY_DELETED,
    FACULTY_PROFILE_VIEWED,

    // Subject & Allocation
    SUBJECT_CREATED,
    SUBJECT_DELETED,
    SUBJECT_ALLOCATED,
    ALLOCATION_REMOVED,
    COURSE_ASSIGNED,
    COURSE_REMOVED,

    // Attendance
    ATTENDANCE_MARKED,
    ATTENDANCE_REPORT_VIEWED,
    ATTENDANCE_REPORT_DOWNLOADED,

    // Assessment & Results
    ASSESSMENT_CREATED,
    RESULTS_UPLOADED,

    // Fee
    FEE_INITIALIZED,
    FEE_PAYMENT_RECORDED,

    // Notice
    NOTICE_CREATED,

    // Timetable
    TIMETABLE_UPLOADED,

    // Exam Schedule
    EXAM_SCHEDULE_UPLOADED,

    // Resource
    RESOURCE_UPLOADED,
    RESOURCE_DOWNLOADED,

    // Generic
    DATA_VIEWED,
    ERROR,
    UNKNOWN
}

