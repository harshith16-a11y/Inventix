package com.smartwarehouse.controller;

import com.smartwarehouse.dto.AuthRequest;
import com.smartwarehouse.dto.AuthResponse;
import com.smartwarehouse.dto.PasswordChangeRequest;
import com.smartwarehouse.dto.RegisterRequest;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : "",
                "warehouse", user.getWarehouse() != null ? user.getWarehouse() : ""
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody PasswordChangeRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            authService.changePassword(user, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
