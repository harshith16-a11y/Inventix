package com.smartwarehouse.service;

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
public class ProductService {

    private final ProductRepository productRepository;
    private final WarehouseHashMap warehouseHashMap;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

    public ProductService(ProductRepository productRepository,
                          WarehouseHashMap warehouseHashMap,
                          NotificationService notificationService,
                          ActivityLogRepository activityLogRepository) {
        this.productRepository = productRepository;
        this.warehouseHashMap = warehouseHashMap;
        this.notificationService = notificationService;
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * O(1) direct Product ID lookup using WarehouseHashMap
     */
    public Product lookupByProductId(String productId) {
        if (productId == null || productId.trim().isEmpty()) return null;
        return warehouseHashMap.get(productId.trim());
    }

    /**
     * Search products: Prioritizes O(1) HashMap lookup when exact Product ID is queried.
     */
    public List<Product> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts();
        }

        String trimmed = query.trim().toUpperCase();
        // Step 1: O(1) direct HashMap check
        Product directMatch = warehouseHashMap.get(trimmed);
        if (directMatch != null) {
            return List.of(directMatch);
        }

        // Step 2: Fallback text search across name and category
        String lowerQuery = query.trim().toLowerCase();
        List<Product> matches = new ArrayList<>();
        for (Product p : warehouseHashMap.getAllProducts()) {
            if (p.getName().toLowerCase().contains(lowerQuery) ||
                (p.getCategory() != null && p.getCategory().toLowerCase().contains(lowerQuery)) ||
                p.getProductId().toLowerCase().contains(lowerQuery)) {
                matches.add(p);
            }
        }
        return matches;
    }

    public List<Product> getAllProducts() {
        return warehouseHashMap.getAllProducts();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Transactional
    public Product createProduct(Product product, Long adminId, String adminName) {
        String pid = product.getProductId().trim().toUpperCase();
        if (warehouseHashMap.containsKey(pid) || productRepository.existsByProductId(pid)) {
            throw new IllegalArgumentException("Product ID " + pid + " already exists.");
        }

        product.setProductId(pid);
        product.updateStatus();
        Product saved = productRepository.save(product);

        // Synchronize in-memory HashMap
        warehouseHashMap.put(saved);

        // Check low stock condition
        checkAndNotifyLowStock(saved);

        activityLogRepository.save(new ActivityLog(adminId, adminName, "PRODUCT_ADDED",
                "Product " + saved.getName() + " (" + saved.getProductId() + ") added with stock " + saved.getQuantity()));

        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, Product updated, Long adminId, String adminName) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        // If product ID changed, verify uniqueness
        String newPid = updated.getProductId().trim().toUpperCase();
        if (!newPid.equalsIgnoreCase(existing.getProductId()) &&
                (warehouseHashMap.containsKey(newPid) || productRepository.existsByProductId(newPid))) {
            throw new IllegalArgumentException("Product ID " + newPid + " already in use.");
        }

        warehouseHashMap.remove(existing.getProductId());

        existing.setProductId(newPid);
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setQuantity(updated.getQuantity());
        existing.setLowStockThreshold(updated.getLowStockThreshold());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.updateStatus();

        Product saved = productRepository.save(existing);
        warehouseHashMap.put(saved);

        checkAndNotifyLowStock(saved);

        activityLogRepository.save(new ActivityLog(adminId, adminName, "PRODUCT_UPDATED",
                "Product " + saved.getName() + " (" + saved.getProductId() + ") updated. Stock: " + saved.getQuantity()));

        return saved;
    }

    @Transactional
    public boolean deleteProduct(Long id, Long adminId, String adminName) {
        return productRepository.findById(id).map(p -> {
            warehouseHashMap.remove(p.getProductId());
            productRepository.delete(p);
            activityLogRepository.save(new ActivityLog(adminId, adminName, "PRODUCT_DELETED",
                    "Product " + p.getName() + " (" + p.getProductId() + ") deleted from system."));
            return true;
        }).orElse(false);
    }

    @Transactional
    public List<Product> createProductsBatch(List<Product> products, Long adminId, String adminName) {
        if (products == null || products.isEmpty()) {
            throw new IllegalArgumentException("Batch list must contain at least one product.");
        }

        java.util.Set<String> seenIds = new java.util.HashSet<>();
        List<Product> toSave = new ArrayList<>();
        int totalUnits = 0;
        double totalValuation = 0.0;

        for (Product p : products) {
            if (p.getProductId() == null || p.getProductId().trim().isEmpty()) {
                throw new IllegalArgumentException("Product ID cannot be empty.");
            }
            if (p.getName() == null || p.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Product name cannot be empty for " + p.getProductId());
            }
            String pid = p.getProductId().trim().toUpperCase();
            if (seenIds.contains(pid) || warehouseHashMap.containsKey(pid) || productRepository.existsByProductId(pid)) {
                throw new IllegalArgumentException("Duplicate Product ID: " + pid);
            }
            seenIds.add(pid);

            p.setProductId(pid);
            if (p.getPrice() == null || p.getPrice() < 0) p.setPrice(0.0);
            if (p.getQuantity() == null || p.getQuantity() < 0) p.setQuantity(0);
            if (p.getLowStockThreshold() == null || p.getLowStockThreshold() < 0) p.setLowStockThreshold(10);
            if (p.getCategory() == null || p.getCategory().trim().isEmpty()) p.setCategory("General Goods");

            p.updateStatus();
            toSave.add(p);
            totalUnits += p.getQuantity();
            totalValuation += (p.getPrice() * p.getQuantity());
        }

        List<Product> savedList = productRepository.saveAll(toSave);

        // Update in-memory HashMap and evaluate low stock
        for (Product saved : savedList) {
            warehouseHashMap.put(saved);
            checkAndNotifyLowStock(saved);
        }

        activityLogRepository.save(new ActivityLog(adminId, adminName, "BATCH_PRODUCTS_ADDED",
                "Admin added batch of " + savedList.size() + " products with " + totalUnits + " total units ($" + String.format("%.2f", totalValuation) + ")"));

        return savedList;
    }

    @Transactional
    public Product quickAdjust(Long id, Double newPrice, Integer newQuantity, Long adminId, String adminName) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        Double oldPrice = existing.getPrice();
        Integer oldQty = existing.getQuantity();

        if (newPrice != null && newPrice >= 0) {
            existing.setPrice(newPrice);
        }
        if (newQuantity != null && newQuantity >= 0) {
            existing.setQuantity(newQuantity);
        }
        existing.setUpdatedAt(LocalDateTime.now());
        existing.updateStatus();

        Product saved = productRepository.save(existing);
        warehouseHashMap.put(saved);
        checkAndNotifyLowStock(saved);

        activityLogRepository.save(new ActivityLog(adminId, adminName, "PRODUCT_QUICK_ADJUST",
                "Product " + saved.getName() + " (" + saved.getProductId() + ") adjusted: Price $" + oldPrice + " -> $" + saved.getPrice()
                        + ", Stock " + oldQty + " -> " + saved.getQuantity() + " units."));

        return saved;
    }

    public String getNextProductId() {
        int maxId = 100;
        for (Product p : warehouseHashMap.getAllProducts()) {
            String pid = p.getProductId();
            if (pid != null && pid.startsWith("P")) {
                try {
                    int num = Integer.parseInt(pid.substring(1));
                    if (num > maxId) {
                        maxId = num;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        return "P" + (maxId + 1);
    }

    public void checkAndNotifyLowStock(Product product) {
        if (product == null) return;
        if (product.getQuantity() <= 0) {
            notificationService.sendNotification(null, "LOW_STOCK",
                    "Out of Stock Alert: " + product.getName() + " (" + product.getProductId() + ") is completely out of stock!");
        } else if (product.getLowStockThreshold() != null && product.getQuantity() < product.getLowStockThreshold()) {
            notificationService.sendNotification(null, "LOW_STOCK",
                    "Low Stock Alert: " + product.getName() + " (" + product.getProductId() + ") has only " + product.getQuantity() + " units remaining.");
        }
    }
}

