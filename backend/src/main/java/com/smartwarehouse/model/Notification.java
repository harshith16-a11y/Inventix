package com.smartwarehouse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null implies broadcast or admin alert
    private Long userId;

    @Column(nullable = false)
    private String type; // SHIPMENT_CREATED, SHIPMENT_QUEUED, SHIPMENT_PROCESSING, SHIPMENT_SHIPPED, SHIPMENT_COMPLETED, LOW_STOCK, SYSTEM

    @Column(nullable = false, length = 1000)
    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(Long userId, String type, String message) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
