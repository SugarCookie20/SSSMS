package com.sssms.portal.controller;

import com.sssms.portal.config.JwtUtil;
import com.sssms.portal.dto.AuthenticationRequest;
import com.sssms.portal.dto.RegisterRequest;
import com.sssms.portal.entity.Role;
import com.sssms.portal.entity.User;
import com.sssms.portal.repository.FacultyRepository;
import com.sssms.portal.repository.StudentRepository;
import com.sssms.portal.repository.UserRepository;
import com.sssms.portal.service.AuthService;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final AuthService service;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // Inject Profile Repositories to fetch Names
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        httpRequest.setAttribute("LOGGED_IN_EMAIL", request.getEmail());
        service.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request, HttpServletRequest httpRequest) {
        UserDetails userDetails = service.authenticateForCookie(request);
        httpRequest.setAttribute("LOGGED_IN_EMAIL", request.getEmail());
        httpRequest.setAttribute("LOGGED_IN_ROLE", userDetails.getAuthorities().iterator().next().getAuthority());
        ResponseCookie jwtCookie = jwtUtil.generateJwtCookie(userDetails);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body("Login successful");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cleanCookie = jwtUtil.getCleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body("You've been signed out!");
    }

    @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            // 1. Fetch User Base Data
            var userOptional = userRepository.findByEmail(userDetails.getUsername());

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Map<String, String> response = new HashMap<>();
                response.put("email", user.getEmail());
                response.put("role", "ROLE_" + user.getRole().name());

                // 2. Fetch Real Name based on Role
                String realName = user.getEmail(); // Default fallback

                if (user.getRole() == Role.FACULTY) {
                    realName = facultyRepository.findById(user.getUserId())
                            .map(f -> f.getFirstName() + " " + f.getLastName())
                            .orElse("Faculty Member");
                } else if (user.getRole() == Role.STUDENT) {
                    realName = studentRepository.findById(user.getUserId())
                            .map(s -> s.getFirstName() + " " + s.getLastName())
                            .orElse("Student");
                } else if (user.getRole() == Role.ADMIN) {
                    realName = "Administrator";
                }

                response.put("name", realName);
                return ResponseEntity.ok(response);
            } else {
                ResponseCookie cleanCookie = jwtUtil.getCleanJwtCookie();
                return ResponseEntity.status(401)
                        .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                        .body("User not found");
            }
        }
}