package com.smartwarehouse.controller;

import com.smartwarehouse.dto.ShipmentCreateRequest;
import com.smartwarehouse.model.Shipment;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.service.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final UserRepository userRepository;

    public ShipmentController(ShipmentService shipmentService, UserRepository userRepository) {
        this.shipmentService = shipmentService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createShipment(Authentication authentication, @RequestBody ShipmentCreateRequest request) {
        try {
            User user = getUserFromAuth(authentication);
            Shipment shipment = shipmentService.createShipment(user, request);

            int position = -1;
            if ("NORMAL".equalsIgnoreCase(shipment.getType())) {
                position = shipmentService.getNormalQueuePosition(shipment.getShipmentId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("shipment", shipment);
            response.put("queuePosition", position);
            response.put("message", "Shipment " + shipment.getShipmentId() + " created successfully.");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getShipments(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        if ("ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(shipmentService.getAllShipments());
        }
        return ResponseEntity.ok(shipmentService.getUserShipments(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShipmentById(@PathVariable Long id) {
        Shipment shipment = shipmentService.getShipmentById(id);
        if (shipment == null) {
            return ResponseEntity.notFound().build();
        }

        int position = -1;
        if ("NORMAL".equalsIgnoreCase(shipment.getType()) && "WAITING".equalsIgnoreCase(shipment.getStatus())) {
            position = shipmentService.getNormalQueuePosition(shipment.getShipmentId());
        }

        Map<String, Object> map = new HashMap<>();
        map.put("shipment", shipment);
        map.put("queuePosition", position);

        return ResponseEntity.ok(map);
    }

    @GetMapping("/queue/normal")
    public ResponseEntity<List<Shipment>> getNormalQueue() {
        return ResponseEntity.ok(shipmentService.getNormalQueueSnapshot());
    }

    @GetMapping("/queue/priority")
    public ResponseEntity<List<Shipment>> getPriorityQueue() {
        return ResponseEntity.ok(shipmentService.getPriorityQueueSnapshot());
    }

    @PostMapping("/process/normal")
    public ResponseEntity<?> processNormalShipment(Authentication authentication) {
        try {
            User admin = getUserFromAuth(authentication);
            Shipment processed = shipmentService.processNormalShipment(admin);
            return ResponseEntity.ok(Map.of(
                    "message", "Normal shipment " + processed.getShipmentId() + " processed successfully via FIFO Queue.",
                    "shipment", processed
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/process/priority")
    public ResponseEntity<?> processPriorityShipment(Authentication authentication) {
        try {
            User admin = getUserFromAuth(authentication);
            Shipment processed = shipmentService.processPriorityShipment(admin);
            return ResponseEntity.ok(Map.of(
                    "message", "Priority shipment " + processed.getShipmentId() + " (" + processed.getPriority() + ") processed successfully.",
                    "shipment", processed
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null) throw new IllegalStateException("Authentication missing");
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
