package com.smartwarehouse.controller;

import com.smartwarehouse.dto.RestockRequest;
import com.smartwarehouse.model.Product;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    public InventoryController(InventoryService inventoryService, UserRepository userRepository) {
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        return ResponseEntity.ok(inventoryService.getLowStockProducts());
    }

    /**
     * Inventory sorted by manual divide-and-conquer MergeSort
     */
    @GetMapping("/sorted")
    public ResponseEntity<List<Product>> getSortedInventory(
            @RequestParam(defaultValue = "productId") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(inventoryService.getSortedInventory(sortBy, direction));
    }

    @PostMapping("/restock")
    public ResponseEntity<?> restockProduct(Authentication authentication, @RequestBody RestockRequest request) {
        if (request.getProductId() == null || request.getQuantity() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product ID and quantity are required."));
        }

        try {
            User admin = getUserFromAuth(authentication);
            Product restocked = inventoryService.restock(request.getProductId(), request.getQuantity(), admin.getId(), admin.getName());
            return ResponseEntity.ok(restocked);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null) throw new IllegalStateException("Authentication missing");
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
