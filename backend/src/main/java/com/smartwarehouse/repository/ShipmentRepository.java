package com.smartwarehouse.repository;

import com.smartwarehouse.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByShipmentId(String shipmentId);
    List<Shipment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Shipment> findByStatusOrderByCreatedAtAsc(String status);
    List<Shipment> findByTypeAndStatusOrderByCreatedAtAsc(String type, String status);
    List<Shipment> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
    long countByTypeAndStatus(String type, String status);
}
