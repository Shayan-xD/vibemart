package com.example.demo.service;

import com.example.demo.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    NotificationDTO addNotification(NotificationDTO notificationDTO);
    List<NotificationDTO> getUserNotifications(String userEmail);
    void markAsRead(Long id);
    void markAllAsRead(String userEmail);
    void removeNotification(Long id);
    void clearUserNotifications(String userEmail);
}
