package com.smartwarehouse.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String productId; // e.g. P101, P214, etc.

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer lowStockThreshold;

    @Column(nullable = false)
    private String status; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Product(String productId, String name, String category, String description, Double price, Integer quantity, Integer lowStockThreshold) {
        this.productId = productId;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.lowStockThreshold = lowStockThreshold;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        updateStatus();
    }

    public void updateStatus() {
        if (this.quantity == null || this.quantity <= 0) {
            this.status = "OUT_OF_STOCK";
        } else if (this.lowStockThreshold != null && this.quantity < this.lowStockThreshold) {
            this.status = "LOW_STOCK";
        } else {
            this.status = "IN_STOCK";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        updateStatus();
    }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
        updateStatus();
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
