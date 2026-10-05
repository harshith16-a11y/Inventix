package com.smartwarehouse.repository;

import com.smartwarehouse.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductId(String productId);
    boolean existsByProductId(String productId);
    List<Product> findByStatus(String status);
    List<Product> findByCategory(String category);
}
