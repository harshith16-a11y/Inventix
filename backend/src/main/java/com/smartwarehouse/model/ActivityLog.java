package com.smartwarehouse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userName;

    @Column(nullable = false)
    private String action; // e.g. "PRODUCT_RESTOCKED", "SHIPMENT_PROCESSED"

    @Column(nullable = false, length = 1000)
    private String description;

    private LocalDateTime createdAt;

    public ActivityLog() {
        this.createdAt = LocalDateTime.now();
    }

    public ActivityLog(Long userId, String userName, String action, String description) {
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
