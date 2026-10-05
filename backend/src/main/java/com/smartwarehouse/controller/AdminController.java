package com.smartwarehouse.controller;

import com.smartwarehouse.dsa.NormalShipmentQueue;
import com.smartwarehouse.dsa.PriorityShipmentQueue;
import com.smartwarehouse.dsa.WarehouseHashMap;
import com.smartwarehouse.dto.ShipmentCreateRequest;
import com.smartwarehouse.model.ActivityLog;
import com.smartwarehouse.model.Product;
import com.smartwarehouse.model.Shipment;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.ActivityLogRepository;
import com.smartwarehouse.repository.ShipmentRepository;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.service.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final WarehouseHashMap warehouseHashMap;
    private final NormalShipmentQueue normalShipmentQueue;
    private final PriorityShipmentQueue priorityShipmentQueue;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ShipmentService shipmentService;

    public AdminController(WarehouseHashMap warehouseHashMap,
                           NormalShipmentQueue normalShipmentQueue,
                           PriorityShipmentQueue priorityShipmentQueue,
                           ShipmentRepository shipmentRepository,
                           UserRepository userRepository,
                           ActivityLogRepository activityLogRepository,
                           ShipmentService shipmentService) {
        this.warehouseHashMap = warehouseHashMap;
        this.normalShipmentQueue = normalShipmentQueue;
        this.priorityShipmentQueue = priorityShipmentQueue;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.shipmentService = shipmentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<Product> products = warehouseHashMap.getAllProducts();

        long totalProducts = products.size();
        long totalInventoryUnits = products.stream().mapToLong(p -> p.getQuantity() != null ? p.getQuantity() : 0).sum();
        long lowStockCount = products.stream().filter(p -> "LOW_STOCK".equalsIgnoreCase(p.getStatus())).count();
        long outOfStockCount = products.stream().filter(p -> "OUT_OF_STOCK".equalsIgnoreCase(p.getStatus())).count();

        long pendingNormal = normalShipmentQueue.size();
        long pendingPriority = priorityShipmentQueue.size();
        long completedShipments = shipmentRepository.countByStatus("COMPLETED");

        double totalInventoryValue = products.stream()
                .mapToDouble(p -> (p.getPrice() != null && p.getQuantity() != null) ? p.getPrice() * p.getQuantity() : 0.0)
                .sum();

        // Category breakdown
        Map<String, Integer> categoryDistribution = new HashMap<>();
        Map<String, Integer> categoryUnits = new HashMap<>();
        for (Product p : products) {
            String cat = p.getCategory() != null ? p.getCategory() : "Uncategorized";
            categoryDistribution.put(cat, categoryDistribution.getOrDefault(cat, 0) + 1);
            categoryUnits.put(cat, categoryUnits.getOrDefault(cat, 0) + (p.getQuantity() != null ? p.getQuantity() : 0));
        }

        // Low stock products list
        List<Product> alertProducts = products.stream()
                .filter(p -> !"IN_STOCK".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("totalProducts", totalProducts);
        data.put("totalInventoryUnits", totalInventoryUnits);
        data.put("lowStockCount", lowStockCount);
        data.put("outOfStockCount", outOfStockCount);
        data.put("pendingNormalShipments", pendingNormal);
        data.put("pendingPriorityShipments", pendingPriority);
        data.put("completedShipments", completedShipments);
        data.put("totalInventoryValue", Math.round(totalInventoryValue * 100.0) / 100.0);
        data.put("categoryDistribution", categoryDistribution);
        data.put("categoryUnits", categoryUnits);
        data.put("criticalAlertProducts", alertProducts);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        return ResponseEntity.ok(activityLogRepository.findTop50ByOrderByCreatedAtDesc());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        List<Map<String, Object>> userList = userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("department", u.getDepartment());
            m.put("warehouse", u.getWarehouse());
            m.put("phone", u.getPhone());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(userList);
    }

    /**
     * One-click demo execution for live demonstration
     */
    @PostMapping("/demo-run")
    public ResponseEntity<?> runAutomatedDemo(Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (admin == null) return ResponseEntity.badRequest().body(Map.of("message", "Admin required"));

        User demoUser = userRepository.findByEmail("user@example.com").orElse(admin);

        List<String> logMessages = new ArrayList<>();
        logMessages.add("1. Initiated live DSA demonstration sequence.");

        // Step 1: O(1) Lookup
        Product p214 = warehouseHashMap.get("P214");
        logMessages.add("2. HashMap O(1) lookup on 'P214': Found '" + p214.getName() + "' with stock " + p214.getQuantity() + ".");

        // Step 2: Create a Normal shipment with 2 units of P214
        ShipmentCreateRequest normalReq = new ShipmentCreateRequest();
        normalReq.setType("NORMAL");
        normalReq.setItems(List.of(new ShipmentCreateRequest.ShipmentItemRequest("P214", 2)));
        Shipment normalShipment = shipmentService.createShipment(demoUser, normalReq);
        logMessages.add("3. Normal Shipment " + normalShipment.getShipmentId() + " created and placed in FIFO ArrayDeque.");

        // Step 3: Create a Priority shipment with 1 unit of P101 (HIGH priority)
        ShipmentCreateRequest prioReq = new ShipmentCreateRequest();
        prioReq.setType("PRIORITY");
        prioReq.setPriority("HIGH");
        prioReq.setItems(List.of(new ShipmentCreateRequest.ShipmentItemRequest("P101", 1)));
        Shipment prioShipment = shipmentService.createShipment(demoUser, prioReq);
        logMessages.add("4. Priority Shipment " + prioShipment.getShipmentId() + " created and placed in PriorityQueue (Heap).");

        // Step 4: Process the Priority Shipment first
        Shipment processedPrio = shipmentService.processPriorityShipment(admin);
        logMessages.add("5. Processed Priority Shipment " + processedPrio.getShipmentId() + " first from Binary Heap.");

        // Step 5: Process the Normal Shipment
        Shipment processedNormal = shipmentService.processNormalShipment(admin);
        logMessages.add("6. Processed Normal Shipment " + processedNormal.getShipmentId() + " from FIFO Queue head.");

        // Step 6: Verify updated inventory
        Product p214Updated = warehouseHashMap.get("P214");
        logMessages.add("7. Verified atomic stock update: P214 now has " + p214Updated.getQuantity() + " units (Status: " + p214Updated.getStatus() + ").");

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Live presentation demonstration executed successfully!",
                "executionLog", logMessages,
                "normalShipmentId", normalShipment.getShipmentId(),
                "priorityShipmentId", prioShipment.getShipmentId()
        ));
    }
}
