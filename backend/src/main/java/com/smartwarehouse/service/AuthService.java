package com.smartwarehouse.service;

import com.smartwarehouse.dto.AuthRequest;
import com.smartwarehouse.dto.AuthResponse;
import com.smartwarehouse.dto.PasswordChangeRequest;
import com.smartwarehouse.dto.RegisterRequest;
import com.smartwarehouse.model.ActivityLog;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.ActivityLogRepository;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ActivityLogRepository activityLogRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.activityLogRepository = activityLogRepository;
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password must be provided.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user);
        activityLogRepository.save(new ActivityLog(user.getId(), user.getName(), "USER_LOGIN",
                "User " + user.getName() + " (" + user.getEmail() + ") logged in successfully."));

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.getDepartment(), user.getWarehouse());
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getPassword() == null || request.getName() == null) {
            throw new IllegalArgumentException("Name, email, and password are required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ROLE_ADMIN"))
                ? "ROLE_ADMIN" : "ROLE_USER";

        User user = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                role,
                request.getPhone(),
                request.getDepartment() != null ? request.getDepartment() : "Logistics",
                request.getWarehouse() != null ? request.getWarehouse() : "Main Central Warehouse"
        );

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);

        activityLogRepository.save(new ActivityLog(user.getId(), user.getName(), "USER_REGISTERED",
                "New account registered: " + user.getName() + " (" + user.getEmail() + ") as " + user.getRole()));

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.getDepartment(), user.getWarehouse());
    }

    public void changePassword(User user, PasswordChangeRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        activityLogRepository.save(new ActivityLog(user.getId(), user.getName(), "PASSWORD_CHANGED",
                "Password updated successfully for " + user.getEmail()));
    }
}
