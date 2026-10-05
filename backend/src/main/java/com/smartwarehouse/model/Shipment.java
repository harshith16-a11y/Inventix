package com.smartwarehouse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String shipmentId; // e.g. SH1001

    @Column(nullable = false)
    private Long userId;

    private String userName;

    @Column(nullable = false)
    private String type; // NORMAL, PRIORITY

    private String priority; // HIGH, MEDIUM, LOW, NONE

    @Column(nullable = false)
    private Integer priorityOrder; // 1 for HIGH, 2 for MEDIUM, 3 for LOW, 4 for NORMAL

    @Column(nullable = false)
    private String status; // CREATED, WAITING, PROCESSING, SHIPPED, COMPLETED

    private Double totalValue;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ShipmentItem> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Shipment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "WAITING";
    }

    public Shipment(String shipmentId, Long userId, String userName, String type, String priority, Double totalValue) {
        this.shipmentId = shipmentId;
        this.userId = userId;
        this.userName = userName;
        this.type = type != null ? type.toUpperCase() : "NORMAL";
        this.priority = priority != null ? priority.toUpperCase() : "NONE";
        this.totalValue = totalValue != null ? totalValue : 0.0;
        this.status = "WAITING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        assignPriorityOrder();
    }

    public void assignPriorityOrder() {
        if ("PRIORITY".equalsIgnoreCase(this.type)) {
            if ("HIGH".equalsIgnoreCase(this.priority)) {
                this.priorityOrder = 1;
            } else if ("MEDIUM".equalsIgnoreCase(this.priority)) {
                this.priorityOrder = 2;
            } else {
                this.priorityOrder = 3;
            }
        } else {
            this.priorityOrder = 4;
            this.priority = "NONE";
        }
    }

    public void addItem(ShipmentItem item) {
        items.add(item);
        item.setShipment(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getType() { return type; }
    public void setType(String type) {
        this.type = type;
        assignPriorityOrder();
    }

    public String getPriority() { return priority; }
    public void setPriority(String priority) {
        this.priority = priority;
        assignPriorityOrder();
    }

    public Integer getPriorityOrder() { return priorityOrder; }
    public void setPriorityOrder(Integer priorityOrder) { this.priorityOrder = priorityOrder; }

    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public Double getTotalValue() { return totalValue; }
    public void setTotalValue(Double totalValue) { this.totalValue = totalValue; }

    public List<ShipmentItem> getItems() { return items; }
    public void setItems(List<ShipmentItem> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
