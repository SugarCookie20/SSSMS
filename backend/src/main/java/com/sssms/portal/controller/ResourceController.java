package com.sssms.portal.controller;

import com.sssms.portal.entity.AcademicResource;
import com.sssms.portal.entity.SubjectAllocation;
import com.sssms.portal.repository.ResourceRepository;
import com.sssms.portal.repository.SubjectAllocationRepository;
import com.sssms.portal.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final FileStorageService fileStorageService;
    private final ResourceRepository resourceRepository;
    private final SubjectAllocationRepository allocationRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("allocationId") Long allocationId,
            @RequestParam("title") String title
    ) {
        SubjectAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));

        String fileName = fileStorageService.storeFile(file);

        AcademicResource resource = AcademicResource.builder()
                .title(title)
                .fileName(fileName)
                .contentType(file.getContentType())
                .allocation(allocation)
                .uploadDate(LocalDateTime.now())
                .build();

        resourceRepository.save(resource);
        return ResponseEntity.ok("File uploaded successfully");
    }

    @GetMapping("/allocation/{allocationId}")
    public ResponseEntity<List<Map<String, Object>>> getResources(@PathVariable Long allocationId) {
        List<AcademicResource> resources = resourceRepository.findByAllocationId(allocationId);
        return ResponseEntity.ok(transformResources(resources));
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<?> deleteResource(@PathVariable Long resourceId) {
        AcademicResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        fileStorageService.deleteFile(resource.getFileName());
        resourceRepository.deleteById(resourceId);
        return ResponseEntity.ok("Resource deleted successfully");
    }

    @GetMapping("/student/{subjectCode}")
    public ResponseEntity<List<Map<String, Object>>> getResourcesBySubject(@PathVariable String subjectCode) {
        List<AcademicResource> resources = resourceRepository.findBySubjectCode(subjectCode);
        return ResponseEntity.ok(transformResources(resources));
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = "application/pdf";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (lower.endsWith(".png")) contentType = "image/png";
        else if (lower.endsWith(".gif")) contentType = "image/gif";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private List<Map<String, Object>> transformResources(List<AcademicResource> resources) {
        return resources.stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getTitle());
            map.put("fileName", r.getFileName());
            map.put("date", r.getUploadDate());
            return map;
        }).collect(Collectors.toList());
    }
}