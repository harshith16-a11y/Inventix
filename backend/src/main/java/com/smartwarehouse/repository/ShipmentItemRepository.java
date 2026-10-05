package com.smartwarehouse.repository;

import com.smartwarehouse.model.ShipmentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipmentItemRepository extends JpaRepository<ShipmentItem, Long> {
    List<ShipmentItem> findByProductId(String productId);
}
