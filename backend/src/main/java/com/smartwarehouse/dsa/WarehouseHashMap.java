package com.smartwarehouse.dsa;

import com.smartwarehouse.model.Product;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WarehouseHashMap
 * DSA Implementation: Hash Table for Product ID lookup and stock access.
 * Average Time Complexity: O(1) for lookup, insertion, update, and deletion.
 * Space Complexity: O(N) where N is number of unique products.
 */
@Component
public class WarehouseHashMap {

    // Internal Hash Map mapping Product ID (e.g. "P101", "P214") -> Product
    private final ConcurrentHashMap<String, Product> productMap = new ConcurrentHashMap<>();

    /**
     * O(1) Product lookup by Product ID
     */
    public Product get(String productId) {
        if (productId == null) return null;
        return productMap.get(productId.trim().toUpperCase());
    }

    /**
     * O(1) Product insertion or update
     */
    public void put(Product product) {
        if (product != null && product.getProductId() != null) {
            productMap.put(product.getProductId().trim().toUpperCase(), product);
        }
    }

    /**
     * O(1) Product deletion by Product ID
     */
    public Product remove(String productId) {
        if (productId == null) return null;
        return productMap.remove(productId.trim().toUpperCase());
    }

    /**
     * O(1) Check if product exists
     */
    public boolean containsKey(String productId) {
        if (productId == null) return false;
        return productMap.containsKey(productId.trim().toUpperCase());
    }

    /**
     * Atomic stock update
     */
    public synchronized boolean deductStock(String productId, int quantityToDeduct) {
        Product product = get(productId);
        if (product == null) return false;
        if (product.getQuantity() < quantityToDeduct) return false;
        
        product.setQuantity(product.getQuantity() - quantityToDeduct);
        put(product);
        return true;
    }

    /**
     * Atomic restock
     */
    public synchronized boolean addStock(String productId, int quantityToAdd) {
        Product product = get(productId);
        if (product == null) return false;
        
        product.setQuantity(product.getQuantity() + quantityToAdd);
        put(product);
        return true;
    }

    /**
     * Return all products in memory snapshot
     */
    public List<Product> getAllProducts() {
        return new ArrayList<>(productMap.values());
    }

    /**
     * Populate HashMap from database
     */
    public void loadAll(List<Product> products) {
        productMap.clear();
        if (products != null) {
            for (Product p : products) {
                put(p);
            }
        }
    }

    public int size() {
        return productMap.size();
    }

    public void clear() {
        productMap.clear();
    }
}
