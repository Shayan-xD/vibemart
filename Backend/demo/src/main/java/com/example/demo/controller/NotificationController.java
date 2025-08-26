package com.example.demo.controller;

import com.example.demo.dto.NotificationDTO;
import com.example.demo.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> addNotification(@RequestBody NotificationDTO notificationDTO) {
        NotificationDTO created = notificationService.addNotification(notificationDTO);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable String userEmail) {
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userEmail);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/user/{userEmail}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userEmail) {
        notificationService.markAllAsRead(userEmail);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeNotification(@PathVariable Long id) {
        notificationService.removeNotification(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userEmail}")
    public ResponseEntity<Void> clearUserNotifications(@PathVariable String userEmail) {
        notificationService.clearUserNotifications(userEmail);
        return ResponseEntity.noContent().build();
    }
}
