package com.smartwarehouse.repository;

import com.smartwarehouse.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(Long userId);
    List<Notification> findAllByOrderByCreatedAtDesc();
    long countByUserIdAndIsReadFalse(Long userId);
}
