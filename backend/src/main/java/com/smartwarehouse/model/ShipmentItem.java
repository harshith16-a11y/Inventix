package com.smartwarehouse.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "shipment_items")
public class ShipmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_fk")
    @JsonIgnore
    private Shipment shipment;

    @Column(nullable = false)
    private String productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double subtotal;

    public ShipmentItem() {}

    public ShipmentItem(String productId, String productName, Integer quantity, Double unitPrice) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = (quantity != null && unitPrice != null) ? quantity * unitPrice : 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.subtotal = (this.quantity != null && this.unitPrice != null) ? this.quantity * this.unitPrice : 0.0;
    }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
        this.subtotal = (this.quantity != null && this.unitPrice != null) ? this.quantity * this.unitPrice : 0.0;
    }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
