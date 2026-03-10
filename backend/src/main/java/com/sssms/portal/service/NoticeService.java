package com.sssms.portal.service;

import com.sssms.portal.dto.request.NoticeRequest;
import com.sssms.portal.entity.*;
import com.sssms.portal.repository.NoticeRepository;
import com.sssms.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public void createNotice(String title, String content, TargetRole targetRole, MultipartFile file, String email, String visibility) {
            User user = userRepository.findByEmail(email).orElseThrow();

            String fileName = null;
            if (file != null && !file.isEmpty()) {
                fileName = fileStorageService.storeFile(file);
            }

            LocalDateTime expiresAt = calculateExpiry(visibility);

            Notice notice = Notice.builder()
                    .title(title)
                    .content(content)
                    .targetRole(targetRole)
                    .attachment(fileName)
                    .date(LocalDateTime.now())
                    .expiresAt(expiresAt)
                    .postedBy(user)
                    .build();

            noticeRepository.save(notice);
    }

    private LocalDateTime calculateExpiry(String visibility) {
        if (visibility == null || visibility.isEmpty() || "FOREVER".equalsIgnoreCase(visibility)) {
            return null; // null means forever
        }
        LocalDateTime now = LocalDateTime.now();
        switch (visibility.toUpperCase()) {
            case "1_DAY":    return now.plusDays(1);
            case "1_WEEK":   return now.plusWeeks(1);
            case "15_DAYS":  return now.plusDays(15);
            case "1_MONTH":  return now.plusMonths(1);
            default:         return null;
        }
    }

    public List<Map<String, Object>> getNoticesForUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Role userRole = user.getRole();
        LocalDateTime now = LocalDateTime.now();

        List<Notice> notices;

        if (userRole == Role.ADMIN) {
            // Admin sees all active (non-expired) notices
            notices = noticeRepository.findAllActiveByOrderByDateDesc(now);
        } else {
            TargetRole target = TargetRole.valueOf(userRole.name());
            notices = noticeRepository.findActiveByTargetRoleOrAll(target, now);
        }

       return notices.stream().map(n -> {
                   Map<String, Object> map = new java.util.HashMap<>();
                   map.put("id", n.getId());
                   map.put("title", n.getTitle());
                   map.put("content", n.getContent());
                   map.put("date", n.getDate());
                   map.put("expiresAt", n.getExpiresAt());
                   map.put("author", n.getPostedBy().getEmail());
                   map.put("target", n.getTargetRole());
                   map.put("attachment", n.getAttachment());
                   return map;
               }).collect(Collectors.toList());
    }

    public void deleteNotice(Long noticeId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Role userRole = user.getRole();

        if (userRole != Role.ADMIN && userRole != Role.FACULTY) {
            throw new RuntimeException("Only Admin or Faculty can delete notices");
        }

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found"));

        // Faculty can only delete their own notices, Admin can delete any
        if (userRole == Role.FACULTY && !notice.getPostedBy().getEmail().equals(email)) {
            throw new RuntimeException("Faculty can only delete their own notices");
        }

        noticeRepository.delete(notice);
    }
}