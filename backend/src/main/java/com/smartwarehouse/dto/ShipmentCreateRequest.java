package com.smartwarehouse.dto;

import java.util.List;

public class ShipmentCreateRequest {
    private String type; // NORMAL or PRIORITY
    private String priority; // HIGH, MEDIUM, LOW, NONE
    private List<ShipmentItemRequest> items;

    public ShipmentCreateRequest() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public List<ShipmentItemRequest> getItems() { return items; }
    public void setItems(List<ShipmentItemRequest> items) { this.items = items; }

    public static class ShipmentItemRequest {
        private String productId;
        private Integer quantity;

        public ShipmentItemRequest() {}
        public ShipmentItemRequest(String productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
