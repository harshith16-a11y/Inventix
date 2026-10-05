package com.smartwarehouse.controller;

import com.smartwarehouse.model.Notification;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(user.getRole());
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getId(), isAdmin));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(user.getRole());
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(user.getId(), isAdmin)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(user.getRole());
        notificationService.markAllAsRead(user.getId(), isAdmin);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null) throw new IllegalStateException("Authentication missing");
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
