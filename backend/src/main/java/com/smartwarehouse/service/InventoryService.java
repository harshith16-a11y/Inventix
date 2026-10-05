package com.smartwarehouse.service;

import com.smartwarehouse.dsa.MergeSort;
import com.smartwarehouse.dsa.WarehouseHashMap;
import com.smartwarehouse.model.ActivityLog;
import com.smartwarehouse.model.Product;
import com.smartwarehouse.repository.ActivityLogRepository;
import com.smartwarehouse.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {

    private final ProductRepository productRepository;
    private final WarehouseHashMap warehouseHashMap;
    private final MergeSort mergeSort;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

    public InventoryService(ProductRepository productRepository,
                            WarehouseHashMap warehouseHashMap,
                            MergeSort mergeSort,
                            NotificationService notificationService,
                            ActivityLogRepository activityLogRepository) {
        this.productRepository = productRepository;
        this.warehouseHashMap = warehouseHashMap;
        this.mergeSort = mergeSort;
        this.notificationService = notificationService;
        this.activityLogRepository = activityLogRepository;
    }

    public List<Product> getAllInventory() {
        return warehouseHashMap.getAllProducts();
    }

    public List<Product> getLowStockProducts() {
        List<Product> lowStockList = new ArrayList<>();
        for (Product p : warehouseHashMap.getAllProducts()) {
            if ("LOW_STOCK".equalsIgnoreCase(p.getStatus()) || "OUT_OF_STOCK".equalsIgnoreCase(p.getStatus())) {
                lowStockList.add(p);
            }
        }
        return lowStockList;
    }

    /**
     * Sorts products using manual divide-and-conquer Merge Sort
     */
    public List<Product> getSortedInventory(String sortBy, String direction) {
        List<Product> all = warehouseHashMap.getAllProducts();
        boolean ascending = direction == null || !"desc".equalsIgnoreCase(direction.trim());
        return mergeSort.sort(all, sortBy, ascending);
    }

    @Transactional
    public Product restock(String productId, int quantityToAdd, Long adminId, String adminName) {
        if (quantityToAdd <= 0) {
            throw new IllegalArgumentException("Restock quantity must be positive.");
        }

        Product product = warehouseHashMap.get(productId);
        if (product == null) {
            product = productRepository.findByProductId(productId.toUpperCase())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        }

        int previousStock = product.getQuantity();
        int newStock = previousStock + quantityToAdd;
        product.setQuantity(newStock);
        product.setUpdatedAt(LocalDateTime.now());
        product.updateStatus();

        Product saved = productRepository.save(product);
        warehouseHashMap.put(saved);

        // Notify if stock recovered above threshold
        if (newStock >= saved.getLowStockThreshold()) {
            notificationService.sendNotification(null, "SYSTEM",
                    "Stock Restocked: " + saved.getName() + " (" + saved.getProductId() + ") replenished by "
                            + quantityToAdd + " units. Current stock: " + newStock + " (Healthy).");
        }

        activityLogRepository.save(new ActivityLog(adminId, adminName, "PRODUCT_RESTOCKED",
                "Product " + saved.getName() + " (" + saved.getProductId() + ") restocked +" + quantityToAdd
                        + " units. Total stock: " + newStock));

        return saved;
    }
}
