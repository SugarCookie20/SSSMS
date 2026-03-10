package com.sssms.portal.config;

import com.sssms.portal.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .exceptionHandling(e -> e.accessDeniedHandler((request, response, accessDeniedException) -> {
                System.out.println("ACCESS DENIED (403): " + accessDeniedException.getMessage() + " for URL: " + request.getRequestURI());
                response.sendError(403, "Access Denied");
            }))

            .headers(headers -> headers.frameOptions(frame -> frame.disable()))

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/change-password").authenticated()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/timetable/view/**", "/api/exams/view/**", "/api/schedules/view/**").permitAll()
                .requestMatchers("/api/notices/download/**", "/api/resources/download/**", "/api/resources/view/**").permitAll()

                // Resource Management (upload/delete) - Faculty & Admin only
                .requestMatchers(HttpMethod.POST, "/api/resources/upload").hasAnyAuthority("ROLE_FACULTY", "FACULTY", "ROLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasAnyAuthority("ROLE_FACULTY", "FACULTY", "ROLE_ADMIN", "ADMIN")

                // Schedule Management (upload/delete) - Faculty & Admin only
                .requestMatchers(HttpMethod.POST, "/api/schedules/upload/**").hasAnyAuthority("ROLE_FACULTY", "FACULTY", "ROLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/schedules/**").hasAnyAuthority("ROLE_FACULTY", "FACULTY", "ROLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/schedules/status").hasAnyAuthority("ROLE_FACULTY", "FACULTY", "ROLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/schedules/student/me").hasAnyAuthority("ROLE_STUDENT", "STUDENT")

                // Admin Routes
                .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                // Faculty Routes
                .requestMatchers("/api/faculty/profile/me").authenticated()
                .requestMatchers("/api/faculty/**").hasAnyAuthority("ROLE_FACULTY", "FACULTY", "ROLE_ADMIN", "ADMIN")

                // Student Routes
                .requestMatchers("/api/student/**").hasAnyAuthority("ROLE_STUDENT", "STUDENT")

                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://sssms-academic-portal-1.onrender.com"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}