package com.sssms.portal.config;

import com.sssms.portal.entity.*;
import com.sssms.portal.repository.*;
import com.sssms.portal.util.PasswordGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final YearMetadataRepository yearRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectAllocationRepository allocationRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final FeeRepository feeRepository;
    private final FeeReminderRepository feeReminderRepository;
    private final NoticeRepository noticeRepository;
    private final ExamResultRepository examResultRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentMarkRepository studentMarkRepository;
    private final AcademicMarksRepository academicMarksRepository;
    private final ClassAssessmentRepository classAssessmentRepository;
    private final ProfessionalDevelopmentRepository pdRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Random random = new Random(42);

    @Override
    public void run(String... args) throws Exception {

        // 1. Seed Years
        if (yearRepository.count() == 0) {
            Arrays.stream(AcademicYear.values()).forEach(year ->
                yearRepository.save(YearMetadata.builder().id(year).build())
            );
            System.out.println("DataSeeder: Academic Years Initialized");
        }

        // Only seed if no users exist
        if (userRepository.count() > 0) {
            System.out.println("DataSeeder: Data already exists, skipping...");
            return;
        }

        // ============================
        // 2. SUBJECTS (across all 5 years)
        // ============================
        List<Subject> subjects = new ArrayList<>();
        String[][] subjectData = {
            {"History of Architecture", "ARC-101", "FIRST_YEAR", "1", "Architecture"},
            {"Design Basics", "ARC-102", "FIRST_YEAR", "1", "Architecture"},
            {"Building Construction I", "ARC-103", "FIRST_YEAR", "2", "Architecture"},
            {"Engineering Mathematics", "ARC-104", "FIRST_YEAR", "2", "Architecture"},
            {"Architectural Design II", "ARC-201", "SECOND_YEAR", "3", "Architecture"},
            {"Building Construction II", "ARC-202", "SECOND_YEAR", "3", "Architecture"},
            {"Structural Systems", "ARC-203", "SECOND_YEAR", "4", "Architecture"},
            {"Climatology", "ARC-204", "SECOND_YEAR", "4", "Architecture"},
            {"Urban Planning", "ARC-301", "THIRD_YEAR", "5", "Architecture"},
            {"Interior Design", "ARC-302", "THIRD_YEAR", "5", "Architecture"},
            {"Building Services I", "ARC-303", "THIRD_YEAR", "6", "Architecture"},
            {"Landscape Architecture", "ARC-304", "THIRD_YEAR", "6", "Architecture"},
            {"Advanced Architectural Design", "ARC-401", "FOURTH_YEAR", "7", "Architecture"},
            {"Project Management", "ARC-402", "FOURTH_YEAR", "7", "Architecture"},
            {"Professional Practice", "ARC-403", "FOURTH_YEAR", "8", "Architecture"},
            {"Green Building Design", "ARC-404", "FOURTH_YEAR", "8", "Architecture"},
            {"Thesis Design Studio", "ARC-501", "FIFTH_YEAR", "9", "Architecture"},
            {"Dissertation", "ARC-502", "FIFTH_YEAR", "9", "Architecture"},
            {"Sustainable Architecture", "ARC-503", "FIFTH_YEAR", "10", "Architecture"},
            {"Research Methodology", "ARC-504", "FIFTH_YEAR", "10", "Architecture"},
        };
        for (String[] sd : subjectData) {
            Subject s = subjectRepository.save(Subject.builder()
                .name(sd[0]).code(sd[1])
                .academicYear(AcademicYear.valueOf(sd[2]))
                .semester(Integer.parseInt(sd[3]))
                .department(sd[4])
                .build());
            subjects.add(s);
        }
        System.out.println("DataSeeder: " + subjects.size() + " Subjects Created");

        // ============================
        // 3. ADMIN USER
        // ============================
        User admin = userRepository.save(User.builder()
            .email("admin@sssms.edu")
            .passwordHash(passwordEncoder.encode("admin123"))
            .role(Role.ADMIN).isActive(true).build());
        System.out.println("DataSeeder: Admin Created (admin@sssms.edu / admin123)");

        // ============================
        // 4. FACULTY (5 faculty members)
        // ============================
        String[][] facultyData = {
            {"Alice", "R.", "Johnson", "Senior Professor", "M.Arch, Ph.D.", "9876543210", "COA/2015/12345", "ABCDE1234F", "1234-5678-9012"},
            {"Rajesh", "K.", "Sharma", "Associate Professor", "M.Arch", "9876543211", "COA/2016/12346", "FGHIJ5678K", "2345-6789-0123"},
            {"Priya", "S.", "Deshmukh", "Assistant Professor", "M.Arch, M.Plan", "9876543212", "COA/2018/12347", "KLMNO9012P", "3456-7890-1234"},
            {"Vikram", "D.", "Patil", "Professor", "Ph.D. Architecture", "9876543213", "COA/2012/12348", "QRSTU3456V", "4567-8901-2345"},
            {"Sneha", "M.", "Kulkarni", "Assistant Professor", "M.Arch", "9876543214", "COA/2020/12349", "WXYZ07890A", "5678-9012-3456"},
        };

        List<Faculty> facultyList = new ArrayList<>();
        LocalDate[] facultyDobs = {
            LocalDate.of(1975, 3, 15),
            LocalDate.of(1980, 7, 22),
            LocalDate.of(1985, 11, 5),
            LocalDate.of(1970, 1, 30),
            LocalDate.of(1990, 9, 12),
        };
        for (int i = 0; i < facultyData.length; i++) {
            String[] fd = facultyData[i];
            String generatedPassword = PasswordGeneratorUtil.generate(fd[2], facultyDobs[i]);
            User fUser = userRepository.save(User.builder()
                .email("faculty" + (i + 1) + "@sssms.edu")
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(Role.FACULTY).isActive(true).build());
            Faculty fProfile = facultyRepository.save(Faculty.builder()
                .user(fUser)
                .firstName(fd[0]).middleName(fd[1]).lastName(fd[2])
                .department("Architecture")
                .designation(fd[3]).qualification(fd[4])
                .phoneNumber(fd[5])
                .dob(facultyDobs[i])
                .joiningDate(LocalDate.of(2012 + i * 2, 6, 1))
                .coaRegistrationNo(fd[6])
                .coaValidFrom(LocalDate.of(2012 + i * 2, 1, 1))
                .coaValidTill(LocalDate.of(2030, 12, 31))
                .aadharNo(fd[8]).panCardNo(fd[7])
                .build());
            facultyList.add(fProfile);
        }
        System.out.println("DataSeeder: 5 Faculty Created (faculty1@sssms.edu ... faculty5@sssms.edu / Password: LastName@DDMMYY)");

        // ============================
        // 5. SUBJECT ALLOCATIONS (faculty -> subjects)
        // ============================
        List<SubjectAllocation> allocations = new ArrayList<>();
        for (int i = 0; i < subjects.size(); i++) {
            Faculty assignedFaculty = facultyList.get(i % facultyList.size());
            SubjectAllocation alloc = allocationRepository.save(SubjectAllocation.builder()
                .faculty(assignedFaculty)
                .subject(subjects.get(i))
                .build());
            allocations.add(alloc);
        }
        System.out.println("DataSeeder: " + allocations.size() + " Subject Allocations Created");

        // ============================
        // 6. STUDENTS (30 students)
        // ============================
        String[][] studentNames = {
            {"Aarav", "Suresh", "Pawar"},     {"Ishita", "Ramesh", "Shinde"},
            {"Rohan", "Vijay", "Jadhav"},      {"Ananya", "Mohan", "More"},
            {"Vihaan", "Prakash", "Gaikwad"},  {"Diya", "Rajendra", "Bhosale"},
            {"Arjun", "Sanjay", "Chavan"},     {"Kavya", "Anil", "Nikam"},
            {"Aditya", "Deepak", "Mane"},      {"Sara", "Kiran", "Kadam"},
            {"Krishna", "Ashok", "Salunkhe"},  {"Meera", "Ganesh", "Desai"},
            {"Yash", "Mahesh", "Joshi"},       {"Riya", "Sunil", "Kulkarni"},
            {"Tanmay", "Dinesh", "Sawant"},    {"Nisha", "Pramod", "Wagh"},
            {"Siddharth", "Satish", "Shete"},  {"Pooja", "Narayan", "Sonawane"},
            {"Pranav", "Bharat", "Ingale"},    {"Simran", "Harish", "Thorat"},
            {"Atharva", "Nilesh", "Kale"},     {"Shruti", "Vikas", "Deshpande"},
            {"Dev", "Umesh", "Mhatre"},        {"Ritika", "Suhas", "Ghate"},
            {"Harsh", "Ravindra", "Phadke"},   {"Trisha", "Santosh", "Naik"},
            {"Om", "Balaji", "Pol"},           {"Aisha", "Sameer", "Khan"},
            {"Vivaan", "Dilip", "Raut"},       {"Neha", "Manoj", "Gavali"},
        };

        String[] bloodGroups = {"A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"};
        AdmissionCategory[] admCats = AdmissionCategory.values();
        ScholarshipStatus[] schStatuses = {ScholarshipStatus.NOT_APPLIED, ScholarshipStatus.APPLIED,
            ScholarshipStatus.APPROVED, ScholarshipStatus.REJECTED};

        // Distribute: 8 in 1st year, 7 in 2nd, 6 in 3rd, 5 in 4th, 4 in 5th
        AcademicYear[] yearAssignment = new AcademicYear[30];
        int idx = 0;
        int[] countPerYear = {8, 7, 6, 5, 4};
        AcademicYear[] years = AcademicYear.values();
        for (int y = 0; y < 5; y++) {
            for (int c = 0; c < countPerYear[y]; c++) {
                yearAssignment[idx++] = years[y];
            }
        }

        List<Student> studentList = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            String[] sn = studentNames[i];
            ScholarshipStatus schStatus = schStatuses[i % schStatuses.length];
            LocalDate studentDob = LocalDate.of(2002 + (i % 4), 1 + (i % 12), 1 + (i % 28));
            String generatedPassword = PasswordGeneratorUtil.generate(sn[2], studentDob);
            User sUser = userRepository.save(User.builder()
                .email("student" + (i + 1) + "@sssms.edu")
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(Role.STUDENT).isActive(true).build());
            Student sProfile = studentRepository.save(Student.builder()
                .user(sUser)
                .firstName(sn[0]).middleName(sn[1]).lastName(sn[2])
                .prn("ARC2024" + String.format("%03d", i + 1))
                .academicYear(yearAssignment[i])
                .dob(studentDob)
                .phoneNumber("98" + String.format("%08d", 10000000 + i * 111111))
                .address((100 + i) + " College Road, Solapur, Maharashtra")
                .coaEnrollmentNo("COA-S-2024-" + String.format("%03d", i + 1))
                .grNo("GR-2024-" + String.format("%03d", 101 + i))
                .aadharNo(String.format("%04d-%04d-%04d", 1000 + i, 2000 + i, 3000 + i))
                .abcId("ABC-" + String.format("%03d", 100 + i) + "-" + String.format("%03d", 400 + i))
                .bloodGroup(bloodGroups[i % bloodGroups.length])
                .parentPhoneNumber("97" + String.format("%08d", 20000000 + i * 222222))
                .admissionCategory(admCats[i % admCats.length])
                .scholarshipStatus(schStatus)
                .scholarshipApplied(schStatus != ScholarshipStatus.NOT_APPLIED)
                .scholarshipApproved(schStatus == ScholarshipStatus.APPROVED)
                .scholarshipReceived(schStatus == ScholarshipStatus.APPROVED && i % 3 == 0)
                .build());
            studentList.add(sProfile);
        }
        System.out.println("DataSeeder: 30 Students Created (student1@sssms.edu ... student30@sssms.edu / Password: LastName@DDMMYY)");

        // ============================
        // 7. ATTENDANCE (30 days of records)
        // ============================
        Map<AcademicYear, List<Student>> studentsByYear = new LinkedHashMap<>();
        for (Student s : studentList) {
            studentsByYear.computeIfAbsent(s.getAcademicYear(), k -> new ArrayList<>()).add(s);
        }

        Map<AcademicYear, List<SubjectAllocation>> allocationsByYear = new LinkedHashMap<>();
        for (SubjectAllocation alloc : allocations) {
            AcademicYear ay = alloc.getSubject().getAcademicYear();
            allocationsByYear.computeIfAbsent(ay, k -> new ArrayList<>()).add(alloc);
        }

        AttendanceStatus[] statuses = {AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT,
            AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED};

        // Generate 30 weekdays going backwards from today
        List<LocalDate> thirtyWeekdays = new ArrayList<>();
        LocalDate d = LocalDate.now();
        while (thirtyWeekdays.size() < 30) {
            if (d.getDayOfWeek().getValue() <= 5) {
                thirtyWeekdays.add(d);
            }
            d = d.minusDays(1);
        }
        Collections.reverse(thirtyWeekdays);

        int totalSessions = 0;
        int totalRecords = 0;
        for (Map.Entry<AcademicYear, List<SubjectAllocation>> entry : allocationsByYear.entrySet()) {
            AcademicYear ay = entry.getKey();
            List<Student> yearStudents = studentsByYear.getOrDefault(ay, Collections.emptyList());
            if (yearStudents.isEmpty()) continue;

            for (SubjectAllocation alloc : entry.getValue()) {
                for (LocalDate date : thirtyWeekdays) {
                    AttendanceSession session = sessionRepository.save(AttendanceSession.builder()
                        .allocation(alloc).date(date).build());
                    totalSessions++;

                    for (Student student : yearStudents) {
                        AttendanceStatus status = statuses[random.nextInt(statuses.length)];
                        attendanceRecordRepository.save(AttendanceRecord.builder()
                            .session(session).student(student).status(status).build());
                        totalRecords++;
                    }
                }
            }
        }
        System.out.println("DataSeeder: " + totalSessions + " Attendance Sessions, " + totalRecords + " Records Created");

        // ============================
        // 8. FEE RECORDS (for all 30 students)
        // ============================
        double[] totalFees = {125000.0, 130000.0, 135000.0, 140000.0, 145000.0};
        for (int i = 0; i < studentList.size(); i++) {
            Student s = studentList.get(i);
            double totalFee = totalFees[s.getAcademicYear().ordinal()];
            double paidPct = 0.4 + (random.nextDouble() * 0.6);
            double scholarship = s.getScholarshipApproved() ? totalFee * 0.25 : 0;
            feeRepository.save(FeeRecord.builder()
                .student(s)
                .totalFee(totalFee)
                .paidAmount(Math.round(totalFee * paidPct * 100.0) / 100.0)
                .scholarshipAmount(scholarship)
                .lastPaymentDate(LocalDateTime.now().minusDays(random.nextInt(60)))
                .build());
        }
        System.out.println("DataSeeder: 30 Fee Records Created");

        // ============================
        // 9. FEE REMINDERS
        // ============================
        feeReminderRepository.save(FeeReminder.builder()
            .title("Semester Fee Due - First Installment")
            .message("Please pay the first installment of your semester fee by the due date. Late payment will attract a fine of Rs. 500.")
            .dueDate(LocalDate.now().plusDays(15))
            .active(true).createdAt(LocalDateTime.now().minusDays(5)).createdBy(admin).build());
        feeReminderRepository.save(FeeReminder.builder()
            .title("Exam Fee Submission")
            .message("All students must submit their exam fee before the commencement of examinations. Fee: Rs. 2,500 per semester.")
            .dueDate(LocalDate.now().plusDays(30))
            .active(true).createdAt(LocalDateTime.now().minusDays(2)).createdBy(admin).build());
        feeReminderRepository.save(FeeReminder.builder()
            .title("Library Fine Clearance")
            .message("Students with pending library fines must clear them before collecting hall tickets.")
            .dueDate(LocalDate.now().plusDays(10))
            .active(true).createdAt(LocalDateTime.now().minusDays(1)).createdBy(admin).build());
        System.out.println("DataSeeder: 3 Fee Reminders Created");

        // ============================
        // 10. NOTICES
        // ============================
        String[][] noticeData = {
            {"Annual Day Celebration 2026", "The Annual Day celebration will be held on 20th March 2026. All students and faculty are requested to participate.", "ALL"},
            {"Mid-Semester Exam Schedule", "Mid-semester examinations will commence from 15th March 2026. Detailed schedule will be shared subject-wise.", "STUDENT"},
            {"Faculty Development Program", "A 5-day FDP on 'AI in Architecture' is scheduled from 25th March 2026. Interested faculty may register.", "FACULTY"},
            {"Workshop on AutoCAD", "A hands-on workshop on AutoCAD will be conducted on 10th March 2026 in the Design Lab.", "STUDENT"},
            {"Campus Placement Drive", "XYZ Architects will visit the campus on 22nd March 2026. Final year students are encouraged to register.", "STUDENT"},
            {"Library Hours Extended", "Library hours have been extended until 9 PM during the examination period.", "ALL"},
            {"Thesis Submission Deadline", "Final year students must submit their thesis draft by 1st April 2026.", "STUDENT"},
            {"Faculty Meeting", "Monthly faculty meeting is scheduled for 12th March 2026 at 3 PM in the conference room.", "FACULTY"},
        };
        for (int i = 0; i < noticeData.length; i++) {
            noticeRepository.save(Notice.builder()
                .title(noticeData[i][0]).content(noticeData[i][1])
                .targetRole(TargetRole.valueOf(noticeData[i][2]))
                .date(LocalDateTime.now().minusDays(noticeData.length - i))
                .postedBy(admin).build());
        }
        System.out.println("DataSeeder: " + noticeData.length + " Notices Created");

        // ============================
        // 11. EXAM RESULTS (for students in 2nd year and above)
        // ============================
        int examResultCount = 0;
        for (Student s : studentList) {
            int yearOrdinal = s.getAcademicYear().ordinal();
            int completedSemesters = yearOrdinal * 2;
            double cumulativeTotal = 0;
            for (int sem = 1; sem <= completedSemesters; sem++) {
                double sgpa = 5.5 + (random.nextDouble() * 4.0);
                sgpa = Math.round(sgpa * 100.0) / 100.0;
                cumulativeTotal += sgpa;
                double cgpa = Math.round((cumulativeTotal / sem) * 100.0) / 100.0;
                String status = sgpa >= 5.0 ? "PASS" : "FAIL";
                examResultRepository.save(ExamResult.builder()
                    .student(s).semester(sem).sgpa(sgpa).cgpa(cgpa)
                    .status(status)
                    .resultDate(LocalDate.now().minusMonths((long)(completedSemesters - sem) * 6))
                    .examSession("Semester " + sem + " - " + (2024 + (sem - 1) / 2))
                    .build());
                examResultCount++;
            }
        }
        System.out.println("DataSeeder: " + examResultCount + " Exam Results Created");

        // ============================
        // 12. ASSESSMENTS & STUDENT MARKS
        // ============================
        int assessmentCount = 0;
        int markCount = 0;
        for (SubjectAllocation alloc : allocations) {
            AcademicYear ay = alloc.getSubject().getAcademicYear();
            List<Student> yearStudents = studentsByYear.getOrDefault(ay, Collections.emptyList());
            if (yearStudents.isEmpty()) continue;

            Assessment ut1 = assessmentRepository.save(Assessment.builder()
                .title("Unit Test 1 - " + alloc.getSubject().getName())
                .type(ExamType.UNIT_TEST_1).maxMarks(25)
                .date(LocalDate.now().minusDays(45))
                .allocation(alloc).build());
            Assessment ut2 = assessmentRepository.save(Assessment.builder()
                .title("Unit Test 2 - " + alloc.getSubject().getName())
                .type(ExamType.UNIT_TEST_2).maxMarks(25)
                .date(LocalDate.now().minusDays(20))
                .allocation(alloc).build());
            Assessment assignment = assessmentRepository.save(Assessment.builder()
                .title("Assignment - " + alloc.getSubject().getName())
                .type(ExamType.ASSIGNMENT).maxMarks(20)
                .date(LocalDate.now().minusDays(10))
                .allocation(alloc).build());
            assessmentCount += 3;

            for (Student student : yearStudents) {
                studentMarkRepository.save(StudentMark.builder()
                    .assessment(ut1).student(student)
                    .marksObtained(10 + random.nextInt(16)).build());
                studentMarkRepository.save(StudentMark.builder()
                    .assessment(ut2).student(student)
                    .marksObtained(10 + random.nextInt(16)).build());
                studentMarkRepository.save(StudentMark.builder()
                    .assessment(assignment).student(student)
                    .marksObtained(8 + random.nextInt(13)).build());
                markCount += 3;
            }
        }
        System.out.println("DataSeeder: " + assessmentCount + " Assessments, " + markCount + " Student Marks Created");

        // ============================
        // 13. ACADEMIC MARKS
        // ============================
        int academicMarkCount = 0;
        for (SubjectAllocation alloc : allocations) {
            AcademicYear ay = alloc.getSubject().getAcademicYear();
            List<Student> yearStudents = studentsByYear.getOrDefault(ay, Collections.emptyList());
            if (yearStudents.isEmpty()) continue;
            Subject subj = alloc.getSubject();

            for (Student student : yearStudents) {
                academicMarksRepository.save(AcademicMarks.builder()
                    .student(student).subject(subj)
                    .examType(ExamType.UNIT_TEST_1)
                    .marksObtained((double)(12 + random.nextInt(14)))
                    .maxMarks(25.0).build());
                academicMarksRepository.save(AcademicMarks.builder()
                    .student(student).subject(subj)
                    .examType(ExamType.UNIT_TEST_2)
                    .marksObtained((double)(12 + random.nextInt(14)))
                    .maxMarks(25.0).build());
                academicMarksRepository.save(AcademicMarks.builder()
                    .student(student).subject(subj)
                    .examType(ExamType.ASSIGNMENT)
                    .marksObtained((double)(10 + random.nextInt(11)))
                    .maxMarks(20.0).build());
                academicMarksRepository.save(AcademicMarks.builder()
                    .student(student).subject(subj)
                    .examType(ExamType.THEORY_ESE)
                    .marksObtained((double)(35 + random.nextInt(46)))
                    .maxMarks(80.0).build());
                academicMarkCount += 4;
            }
        }
        System.out.println("DataSeeder: " + academicMarkCount + " Academic Marks Created");

        // ============================
        // 14. CLASS ASSESSMENTS
        // ============================
        int classAssessmentCount = 0;
        String[] caExamTypes = {"JURY", "VIVA", "PRACTICAL"};
        for (int ai = 0; ai < allocations.size(); ai++) {
            SubjectAllocation alloc = allocations.get(ai);
            AcademicYear ay = alloc.getSubject().getAcademicYear();
            List<Student> yearStudents = studentsByYear.getOrDefault(ay, Collections.emptyList());
            if (yearStudents.isEmpty()) continue;

            String examType = caExamTypes[ai % caExamTypes.length];
            for (Student student : yearStudents) {
                classAssessmentRepository.save(ClassAssessment.builder()
                    .allocation(alloc).student(student)
                    .examType(examType)
                    .marksObtained((double)(30 + random.nextInt(51)))
                    .maxMarks(100.0).build());
                classAssessmentCount++;
            }
        }
        System.out.println("DataSeeder: " + classAssessmentCount + " Class Assessments Created");

        // ============================
        // 15. PROFESSIONAL DEVELOPMENT (for faculty)
        // ============================
        String[][] pdData = {
            {"Workshop on Sustainable Design", "WORKSHOP", "Council of Architecture", "Completed a 3-day workshop on sustainable architectural practices."},
            {"FDP on BIM Technology", "FDP", "AICTE", "Faculty Development Program on Building Information Modeling."},
            {"National Conference on Urban Design", "CONFERENCE", "Indian Institute of Architects", "Presented paper on smart city planning approaches."},
            {"AutoCAD Certification", "CERTIFICATION", "Autodesk", "Professional certification in AutoCAD for architecture."},
            {"Seminar on Heritage Conservation", "SEMINAR", "INTACH", "Participated in seminar on conservation of historical structures."},
            {"QIP on Research Methodology", "QIP", "UGC", "Quality Improvement Program on advanced research methods."},
            {"Workshop on Parametric Design", "WORKSHOP", "AA School London", "3-day workshop on computational design using Grasshopper."},
            {"FDP on Pedagogy in Architecture", "FDP", "Council of Architecture", "5-day FDP on innovative teaching methods in architecture education."},
            {"Conference on Disaster Resilient Architecture", "CONFERENCE", "NDMA", "Presented research on earthquake-resistant building designs."},
            {"Revit Certification", "CERTIFICATION", "Autodesk", "Professional certification in Revit Architecture."},
        };
        int pdCount = 0;
        for (int i = 0; i < pdData.length; i++) {
            Faculty f = facultyList.get(i % facultyList.size());
            LocalDate startDt = LocalDate.now().minusMonths(3 + i * 2);
            pdRepository.save(ProfessionalDevelopment.builder()
                .faculty(f)
                .title(pdData[i][0])
                .type(ProfessionalDevelopment.PDType.valueOf(pdData[i][1]))
                .organization(pdData[i][2])
                .startDate(startDt)
                .endDate(startDt.plusDays(2 + i % 5))
                .description(pdData[i][3])
                .createdAt(LocalDateTime.now().minusDays(60 - i * 5))
                .addedBy("admin@sssms.edu")
                .build());
            pdCount++;
        }
        System.out.println("DataSeeder: " + pdCount + " Professional Development Records Created");

        // ============================
        // SUMMARY
        // ============================
        System.out.println("\n========================================");
        System.out.println("  SSSMS Academic Portal - Data Seeded!");
        System.out.println("========================================");
        System.out.println("  Admin:    admin@sssms.edu / admin123");
        System.out.println("  Faculty:  faculty1@sssms.edu ... faculty5@sssms.edu / LastName@DDMMYY");
        System.out.println("    e.g., faculty1 (Johnson, DOB 1975-03-15) → Johnson@150375");
        System.out.println("  Students: student1@sssms.edu ... student30@sssms.edu / LastName@DDMMYY");
        System.out.println("    e.g., student1 (Pawar, DOB 2002-01-01) → Pawar@010102");
        System.out.println("========================================\n");
    }
}

