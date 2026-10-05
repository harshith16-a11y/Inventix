package com.smartwarehouse.service;

import com.smartwarehouse.model.Notification;
import com.smartwarehouse.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification sendNotification(Long userId, String type, String message) {
        Notification notification = new Notification(userId, type, message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId, boolean isAdmin) {
        if (isAdmin) {
            return notificationRepository.findAllByOrderByCreatedAtDesc();
        }
        return notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId, boolean isAdmin) {
        if (isAdmin) {
            return notificationRepository.findAll().stream().filter(n -> !n.isRead()).count();
        }
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public boolean markAsRead(Long id) {
        return notificationRepository.findById(id).map(n -> {
            n.setRead(true);
            notificationRepository.save(n);
            return true;
        }).orElse(false);
    }

    public void markAllAsRead(Long userId, boolean isAdmin) {
        List<Notification> list = isAdmin ? notificationRepository.findAll()
                : notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }
}
