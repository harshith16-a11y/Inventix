package com.smartwarehouse.controller;

import com.smartwarehouse.model.Product;
import com.smartwarehouse.model.User;
import com.smartwarehouse.repository.UserRepository;
import com.smartwarehouse.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product p = productService.getProductById(id);
        if (p == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(p);
    }

    /**
     * O(1) HashMap lookup by Product ID (e.g. P101, P214)
     */
    @GetMapping("/search/{productId}")
    public ResponseEntity<?> searchByProductId(@PathVariable String productId) {
        Product product = productService.lookupByProductId(productId);
        if (product == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Product not found with ID: " + productId));
        }
        return ResponseEntity.ok(product);
    }

    @GetMapping("/query")
    public ResponseEntity<List<Product>> queryProducts(@RequestParam(value = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(Authentication authentication, @RequestBody Product product) {
        try {
            User admin = getUserFromAuth(authentication);
            Product saved = productService.createProduct(product, admin.getId(), admin.getName());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(Authentication authentication, @PathVariable Long id, @RequestBody Product product) {
        try {
            User admin = getUserFromAuth(authentication);
            Product updated = productService.updateProduct(id, product, admin.getId(), admin.getName());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<?> createProductsBatch(Authentication authentication, @RequestBody List<Product> products) {
        try {
            User admin = getUserFromAuth(authentication);
            List<Product> saved = productService.createProductsBatch(products, admin.getId(), admin.getName());
            return ResponseEntity.ok(Map.of(
                    "message", "Successfully added batch of " + saved.size() + " products to warehouse inventory.",
                    "products", saved,
                    "count", saved.size()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/quick-adjust")
    public ResponseEntity<?> quickAdjustProduct(Authentication authentication,
                                               @PathVariable Long id,
                                               @RequestBody Map<String, Object> payload) {
        try {
            User admin = getUserFromAuth(authentication);
            Double price = payload.containsKey("price") && payload.get("price") != null
                    ? Double.valueOf(payload.get("price").toString()) : null;
            Integer quantity = payload.containsKey("quantity") && payload.get("quantity") != null
                    ? Integer.valueOf(payload.get("quantity").toString()) : null;

            Product updated = productService.quickAdjust(id, price, quantity, admin.getId(), admin.getName());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/next-id")
    public ResponseEntity<?> getNextProductId() {
        return ResponseEntity.ok(Map.of("nextProductId", productService.getNextProductId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(Authentication authentication, @PathVariable Long id) {
        User admin = getUserFromAuth(authentication);
        boolean deleted = productService.deleteProduct(id, admin.getId(), admin.getName());
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null) throw new IllegalStateException("Authentication missing");
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}

