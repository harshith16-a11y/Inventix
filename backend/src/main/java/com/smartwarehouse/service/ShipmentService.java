package com.smartwarehouse.service;

import com.smartwarehouse.dsa.NormalShipmentQueue;
import com.smartwarehouse.dsa.PriorityShipmentQueue;
import com.smartwarehouse.dsa.WarehouseHashMap;
import com.smartwarehouse.dto.ShipmentCreateRequest;
import com.smartwarehouse.model.*;
import com.smartwarehouse.repository.ActivityLogRepository;
import com.smartwarehouse.repository.ProductRepository;
import com.smartwarehouse.repository.ShipmentItemRepository;
import com.smartwarehouse.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentItemRepository shipmentItemRepository;
    private final ProductRepository productRepository;
    private final WarehouseHashMap warehouseHashMap;
    private final NormalShipmentQueue normalShipmentQueue;
    private final PriorityShipmentQueue priorityShipmentQueue;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

    private final AtomicLong shipmentCounter = new AtomicLong(1000);

    public ShipmentService(ShipmentRepository shipmentRepository,
                           ShipmentItemRepository shipmentItemRepository,
                           ProductRepository productRepository,
                           WarehouseHashMap warehouseHashMap,
                           NormalShipmentQueue normalShipmentQueue,
                           PriorityShipmentQueue priorityShipmentQueue,
                           NotificationService notificationService,
                           ActivityLogRepository activityLogRepository) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentItemRepository = shipmentItemRepository;
        this.productRepository = productRepository;
        this.warehouseHashMap = warehouseHashMap;
        this.normalShipmentQueue = normalShipmentQueue;
        this.priorityShipmentQueue = priorityShipmentQueue;
        this.notificationService = notificationService;
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional
    public Shipment createShipment(User user, ShipmentCreateRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Shipment must contain at least one product.");
        }

        // STEP 1: Validate stock for all items using WarehouseHashMap (O(1) lookups)
        double totalValue = 0.0;
        List<ShipmentItem> itemsToCreate = new ArrayList<>();

        for (ShipmentCreateRequest.ShipmentItemRequest itemReq : request.getItems()) {
            String pid = itemReq.getProductId().trim().toUpperCase();
            Product product = warehouseHashMap.get(pid);
            if (product == null) {
                throw new IllegalArgumentException("Product not found with ID: " + pid);
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0 for product: " + product.getName());
            }
            if (itemReq.getQuantity() > product.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock available for " + product.getName()
                        + " (" + pid + "). Available: " + product.getQuantity() + ", Requested: " + itemReq.getQuantity());
            }

            ShipmentItem item = new ShipmentItem(pid, product.getName(), itemReq.getQuantity(), product.getPrice());
            itemsToCreate.add(item);
            totalValue += item.getSubtotal();
        }

        // STEP 2: Generate unique Shipment ID
        String shipmentId = "SH" + shipmentCounter.incrementAndGet();

        // STEP 3: Create Shipment record
        String type = (request.getType() != null && request.getType().equalsIgnoreCase("PRIORITY"))
                ? "PRIORITY" : "NORMAL";
        String priority = ("PRIORITY".equals(type) && request.getPriority() != null)
                ? request.getPriority().toUpperCase() : "NONE";

        Shipment shipment = new Shipment(shipmentId, user.getId(), user.getName(), type, priority, totalValue);
        for (ShipmentItem item : itemsToCreate) {
            shipment.addItem(item);
        }

        Shipment saved = shipmentRepository.save(shipment);

        // STEP 4: Enqueue into appropriate DSA Queue
        if ("NORMAL".equalsIgnoreCase(type)) {
            normalShipmentQueue.enqueue(saved);
            int pos = normalShipmentQueue.getPosition(saved.getShipmentId());
            notificationService.sendNotification(user.getId(), "SHIPMENT_QUEUED",
                    "Shipment " + saved.getShipmentId() + " was added to the Normal Queue (Position #" + pos + ").");
            activityLogRepository.save(new ActivityLog(user.getId(), user.getName(), "SHIPMENT_CREATED",
                    "Normal shipment " + saved.getShipmentId() + " added to FIFO Queue. Value: $" + String.format("%.2f", totalValue)));
        } else {
            priorityShipmentQueue.enqueue(saved);
            notificationService.sendNotification(user.getId(), "SHIPMENT_QUEUED",
                    "Shipment " + saved.getShipmentId() + " was added to the Priority Queue with " + saved.getPriority() + " priority.");
            activityLogRepository.save(new ActivityLog(user.getId(), user.getName(), "PRIORITY_SHIPMENT_CREATED",
                    "Priority shipment " + saved.getShipmentId() + " (" + saved.getPriority() + ") added to Priority Queue. Value: $" + String.format("%.2f", totalValue)));
        }

        return saved;
    }

    /**
     * Admin processes next Normal shipment from FIFO Queue
     */
    @Transactional
    public Shipment processNormalShipment(User admin) {
        if (normalShipmentQueue.isEmpty()) {
            throw new IllegalStateException("Normal shipment queue is currently empty.");
        }

        Shipment shipment = normalShipmentQueue.dequeue();
        return executeShipmentDispatch(shipment, admin, "NORMAL");
    }

    /**
     * Admin processes highest priority shipment from Priority Queue
     */
    @Transactional
    public Shipment processPriorityShipment(User admin) {
        if (priorityShipmentQueue.isEmpty()) {
            throw new IllegalStateException("Priority shipment queue is currently empty.");
        }

        Shipment shipment = priorityShipmentQueue.dequeue();
        return executeShipmentDispatch(shipment, admin, "PRIORITY");
    }

    /**
     * Executes atomic inventory deduction, low-stock evaluation, and status transition
     */
    private Shipment executeShipmentDispatch(Shipment shipment, User admin, String queueType) {
        // Fetch fresh shipment from repository
        Shipment freshShipment = shipmentRepository.findById(shipment.getId())
                .orElse(shipment);

        freshShipment.setStatus("PROCESSING");
        shipmentRepository.save(freshShipment);

        // Process inventory reduction for each item
        for (ShipmentItem item : freshShipment.getItems()) {
            String pid = item.getProductId();
            Product product = warehouseHashMap.get(pid);
            if (product == null) {
                product = productRepository.findByProductId(pid)
                        .orElseThrow(() -> new IllegalStateException("Product " + pid + " missing in inventory!"));
            }

            int currentStock = product.getQuantity();
            int deductQty = item.getQuantity();

            if (currentStock < deductQty) {
                throw new IllegalStateException("Stock inconsistency detected during processing for "
                        + product.getName() + " (" + pid + "). Available: " + currentStock + ", Required: " + deductQty);
            }

            // Deduct stock in HashMap and DB
            int newStock = currentStock - deductQty;
            product.setQuantity(newStock);
            product.setUpdatedAt(LocalDateTime.now());
            product.updateStatus();

            Product savedProduct = productRepository.save(product);
            warehouseHashMap.put(savedProduct);

            // EVALUATE LOW STOCK RULE:
            // IF quantity < lowStockThreshold -> trigger low stock alert
            if (newStock < savedProduct.getLowStockThreshold()) {
                String alertMsg = (newStock == 0)
                        ? "Out of Stock Alert: " + savedProduct.getName() + " (" + savedProduct.getProductId() + ") reached 0 units!"
                        : "Low Stock Alert: " + savedProduct.getName() + " (" + savedProduct.getProductId() + ") has only " + newStock + " units remaining.";
                notificationService.sendNotification(null, "LOW_STOCK", alertMsg);
                activityLogRepository.save(new ActivityLog(admin.getId(), admin.getName(), "LOW_STOCK_DETECTED", alertMsg));
            }
        }

        // Finalize shipment status: PROCESSING -> COMPLETED
        freshShipment.setStatus("COMPLETED");
        freshShipment.setUpdatedAt(LocalDateTime.now());
        Shipment completed = shipmentRepository.save(freshShipment);

        // Send notifications and audit log
        notificationService.sendNotification(completed.getUserId(), "SHIPMENT_COMPLETED",
                "Shipment " + completed.getShipmentId() + " has been processed and completed successfully.");

        activityLogRepository.save(new ActivityLog(admin.getId(), admin.getName(), "SHIPMENT_PROCESSED",
                "Admin " + admin.getName() + " processed " + queueType + " shipment " + completed.getShipmentId()
                        + " (Items: " + completed.getItems().size() + ", Total: $" + String.format("%.2f", completed.getTotalValue()) + ")"));

        return completed;
    }

    public List<Shipment> getNormalQueueSnapshot() {
        return normalShipmentQueue.getQueueSnapshot();
    }

    public List<Shipment> getPriorityQueueSnapshot() {
        return priorityShipmentQueue.getSnapshotList();
    }

    public List<Shipment> getUserShipments(Long userId) {
        return shipmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAllByOrderByCreatedAtDesc();
    }

    public Shipment getShipmentById(Long id) {
        return shipmentRepository.findById(id).orElse(null);
    }

    public Shipment getShipmentByShipmentId(String shipmentId) {
        return shipmentRepository.findByShipmentId(shipmentId).orElse(null);
    }

    public int getNormalQueuePosition(String shipmentId) {
        return normalShipmentQueue.getPosition(shipmentId);
    }
}
