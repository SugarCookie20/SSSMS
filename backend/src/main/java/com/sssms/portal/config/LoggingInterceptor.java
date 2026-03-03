package com.sssms.portal.config;

import com.sssms.portal.entity.ActivityLog;
import com.sssms.portal.entity.LogAction;
import com.sssms.portal.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoggingInterceptor implements HandlerInterceptor {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                 Object handler, Exception ex) {
        try {
            String endpoint = request.getRequestURI();
            String httpMethod = request.getMethod();

            if ("OPTIONS".equals(httpMethod) || endpoint.startsWith("/api/admin/logs")) {
                return;
            }

            // Skip noisy/routine GET endpoints that flood the logs
            if ("GET".equals(httpMethod) && isNoisyEndpoint(endpoint)) {
                return;
            }

            int status = response.getStatus();
            String userEmail = extractUserEmail(request);
            String userRole = extractUserRole(request);
            String ipAddress = extractIpAddress(request);

            LogAction action;
            String description;
            String errorMessage = null;

            if (ex != null) {
                action = LogAction.ERROR;
                description = "ERROR at " + endpoint;
                errorMessage = ex.getClass().getSimpleName() + ": " + ex.getMessage();
            } else if (status >= 400) {
                action = LogAction.ERROR;
                description = "HTTP " + status + " at " + endpoint;
                errorMessage = "HTTP Status: " + status;
            } else {
                action = resolveAction(httpMethod, endpoint);
                description = buildDescription(action, httpMethod, endpoint);
            }

            ActivityLog logEntry = ActivityLog.builder()
                    .action(action)
                    .description(description)
                    .userEmail(userEmail)
                    .userRole(userRole)
                    .ipAddress(ipAddress)
                    .httpMethod(httpMethod)
                    .endpoint(endpoint)
                    .httpStatus(status)
                    .errorMessage(errorMessage)
                    .timestamp(LocalDateTime.now())
                    .build();

            activityLogRepository.save(logEntry);
            log.info("LOG: {} | {} {} | {} | {}", action, httpMethod, endpoint, userEmail, status);

        } catch (Exception e) {
            log.error("Logging failed: {}", e.getMessage());
        }
    }

    private String extractUserEmail(HttpServletRequest request) {
        Object attr = request.getAttribute("LOGGED_IN_EMAIL");
        if (attr != null) {
            return attr.toString();
        }
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetails ud) {
                return ud.getUsername();
            }
        } catch (Exception ignored) {}
        return "anonymous";
    }

    private String extractUserRole(HttpServletRequest request) {
        Object attr = request.getAttribute("LOGGED_IN_ROLE");
        if (attr != null) {
            return attr.toString();
        }
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
                return auth.getAuthorities().iterator().next().getAuthority();
            }
        } catch (Exception ignored) {}
        return "UNKNOWN";
    }

    private String extractIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private LogAction resolveAction(String httpMethod, String endpoint) {
        if (endpoint.contains("/api/auth/login")) return LogAction.LOGIN;
        if (endpoint.contains("/api/auth/logout")) return LogAction.LOGOUT;
        if (endpoint.contains("/api/auth/register")) return LogAction.REGISTER;
        if (endpoint.contains("/api/auth/me")) return LogAction.DATA_VIEWED;

        if (endpoint.matches(".*/api/admin/enroll-student") && "POST".equals(httpMethod)) return LogAction.STUDENT_ENROLLED;
        if (endpoint.matches(".*/api/admin/student/\\d+") && "PUT".equals(httpMethod)) return LogAction.STUDENT_UPDATED;
        if (endpoint.matches(".*/api/admin/student/\\d+") && "DELETE".equals(httpMethod)) return LogAction.STUDENT_DELETED;
        if (endpoint.matches(".*/api/admin/student/\\d+/profile")) return LogAction.STUDENT_PROFILE_VIEWED;

        if (endpoint.contains("/api/admin/enroll-faculty")) return LogAction.FACULTY_ENROLLED;
        if (endpoint.matches(".*/api/admin/faculty/\\d+") && "DELETE".equals(httpMethod)) return LogAction.FACULTY_DELETED;
        if (endpoint.matches(".*/api/admin/faculty/\\d+/profile")) return LogAction.FACULTY_PROFILE_VIEWED;

        if (endpoint.contains("/api/admin/subjects") && "POST".equals(httpMethod)) return LogAction.SUBJECT_CREATED;
        if (endpoint.matches(".*/api/admin/subject/\\d+") && "DELETE".equals(httpMethod)) return LogAction.SUBJECT_DELETED;
        if (endpoint.contains("/api/admin/allocate-subject")) return LogAction.SUBJECT_ALLOCATED;
        if (endpoint.matches(".*/api/admin/allocation/\\d+") && "DELETE".equals(httpMethod)) return LogAction.ALLOCATION_REMOVED;
        if (endpoint.matches(".*/api/admin/student/\\d+/course/\\d+") && "POST".equals(httpMethod)) return LogAction.COURSE_ASSIGNED;
        if (endpoint.matches(".*/api/admin/student/\\d+/course/\\d+") && "DELETE".equals(httpMethod)) return LogAction.COURSE_REMOVED;

        if (endpoint.contains("/api/admin/upload-results")) return LogAction.RESULTS_UPLOADED;

        if (endpoint.contains("/api/faculty/attendance") && "POST".equals(httpMethod)) return LogAction.ATTENDANCE_MARKED;
        if (endpoint.matches(".*/api/faculty/report/\\d+") && "GET".equals(httpMethod)) return LogAction.ATTENDANCE_REPORT_VIEWED;
        if (endpoint.matches(".*/api/faculty/report/download/\\d+")) return LogAction.ATTENDANCE_REPORT_DOWNLOADED;

        if (endpoint.contains("/api/faculty/assessment") && "POST".equals(httpMethod)) return LogAction.ASSESSMENT_CREATED;

        if (endpoint.contains("/api/admin/fees/init")) return LogAction.FEE_INITIALIZED;
        if (endpoint.contains("/api/admin/fees/pay")) return LogAction.FEE_PAYMENT_RECORDED;

        if (endpoint.contains("/api/notices") && "POST".equals(httpMethod)) return LogAction.NOTICE_CREATED;

        if (endpoint.contains("/api/timetable/upload")) return LogAction.TIMETABLE_UPLOADED;
        if (endpoint.contains("/api/exams/upload")) return LogAction.EXAM_SCHEDULE_UPLOADED;

        if (endpoint.contains("/api/resources/upload")) return LogAction.RESOURCE_UPLOADED;
        if (endpoint.contains("/api/resources/download")) return LogAction.RESOURCE_DOWNLOADED;

        if ("GET".equals(httpMethod)) return LogAction.DATA_VIEWED;
        return LogAction.UNKNOWN;
    }


    // Endpoints that generate too many DATA_VIEWED logs with little audit value.
    // These are skipped to prevent the activity_logs table from growing too fast.

    private boolean isNoisyEndpoint(String endpoint) {
        return endpoint.equals("/api/auth/me")
                || endpoint.startsWith("/api/notices") && !endpoint.contains("upload")
                || endpoint.startsWith("/api/timetable") && !endpoint.contains("upload")
                || endpoint.startsWith("/api/exams") && !endpoint.contains("upload")
                || endpoint.startsWith("/api/student/dashboard")
                || endpoint.startsWith("/api/faculty/dashboard")
                || endpoint.startsWith("/api/admin/dashboard");
    }

    private String buildDescription(LogAction action, String httpMethod, String endpoint) {
        return switch (action) {
            case LOGIN -> "User logged in";
            case LOGOUT -> "User logged out";
            case REGISTER -> "New user registered";
            case STUDENT_ENROLLED -> "New student enrolled";
            case STUDENT_UPDATED -> "Student record updated";
            case STUDENT_DELETED -> "Student un-enrolled";
            case STUDENT_PROFILE_VIEWED -> "Student profile viewed";
            case FACULTY_ENROLLED -> "New faculty enrolled";
            case FACULTY_DELETED -> "Faculty un-enrolled";
            case FACULTY_PROFILE_VIEWED -> "Faculty profile viewed";
            case SUBJECT_CREATED -> "New subject created";
            case SUBJECT_DELETED -> "Subject deleted";
            case SUBJECT_ALLOCATED -> "Subject allocated to faculty";
            case ALLOCATION_REMOVED -> "Subject allocation removed";
            case COURSE_ASSIGNED -> "Extra course assigned to student";
            case COURSE_REMOVED -> "Extra course removed from student";
            case ATTENDANCE_MARKED -> "Attendance marked";
            case ATTENDANCE_REPORT_VIEWED -> "Attendance report viewed";
            case ATTENDANCE_REPORT_DOWNLOADED -> "Attendance report downloaded";
            case ASSESSMENT_CREATED -> "Assessment/grading created";
            case RESULTS_UPLOADED -> "Exam results uploaded";
            case FEE_INITIALIZED -> "Fee initialized for student";
            case FEE_PAYMENT_RECORDED -> "Fee payment recorded";
            case NOTICE_CREATED -> "Notice posted";
            case TIMETABLE_UPLOADED -> "Timetable uploaded";
            case EXAM_SCHEDULE_UPLOADED -> "Exam schedule uploaded";
            case RESOURCE_UPLOADED -> "Academic resource uploaded";
            case RESOURCE_DOWNLOADED -> "Academic resource downloaded";
            case DATA_VIEWED -> httpMethod + " " + endpoint;
            case ERROR -> "Error at " + endpoint;
            case UNKNOWN -> httpMethod + " " + endpoint;
        };
    }
}

