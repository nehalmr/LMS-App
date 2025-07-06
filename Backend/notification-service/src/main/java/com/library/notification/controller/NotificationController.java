package com.library.notification.controller;

import com.library.notification.dto.NotificationDTO;
import com.library.notification.entity.Notification;
import com.library.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@Tag(name = "Notification Management", description = "APIs for managing notifications and alerts")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications", description = "Retrieve a list of all notifications")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        List<NotificationDTO> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID", description = "Retrieve a specific notification by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notification"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<NotificationDTO> getNotificationById(
            @Parameter(description = "Notification ID") @PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(notification -> ResponseEntity.ok(notification))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/member/{memberId}")
    @Operation(summary = "Get notifications by member ID", description = "Retrieve all notifications for a specific member")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByMemberId(
            @Parameter(description = "Member ID") @PathVariable Long memberId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByMemberId(memberId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get notifications by status", description = "Retrieve notifications filtered by status")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByStatus(
            @Parameter(description = "Notification status") @PathVariable Notification.NotificationStatus status) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByStatus(status);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping
    @Operation(summary = "Create notification", description = "Create a new notification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notification created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<NotificationDTO> createNotification(
            @Valid @RequestBody NotificationDTO notificationDTO) {
        NotificationDTO createdNotification = notificationService.createNotification(notificationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }

    @PostMapping("/due-reminder")
    @Operation(summary = "Create due reminder", description = "Create a due reminder notification")
    public ResponseEntity<?> createDueReminder(@RequestBody Map<String, Object> request) {
        if (request.get("memberId") == null || request.get("memberEmail") == null ||
            request.get("bookTitle") == null || request.get("dueDate") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: memberId, memberEmail, bookTitle, dueDate are required."));
        }
        try {
            Long memberId = Long.valueOf(request.get("memberId").toString());
            String memberEmail = request.get("memberEmail").toString();
            String bookTitle = request.get("bookTitle").toString();
            String dueDate = request.get("dueDate").toString();
            if (memberId <= 0 || memberEmail.isBlank() || bookTitle.isBlank() || dueDate.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or blank field(s) in request."));
            }
            NotificationDTO notification = notificationService.createDueReminderNotification(
                    memberId, memberEmail, bookTitle, dueDate);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input: " + e.getMessage()));
        }
    }

    @PostMapping("/overdue-alert")
    @Operation(summary = "Create overdue alert", description = "Create an overdue book alert notification")
    public ResponseEntity<?> createOverdueAlert(@RequestBody Map<String, Object> request) {
        if (request.get("memberId") == null || request.get("memberEmail") == null ||
            request.get("bookTitle") == null || request.get("overdueDays") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: memberId, memberEmail, bookTitle, overdueDays are required."));
        }
        try {
            Long memberId = Long.valueOf(request.get("memberId").toString());
            String memberEmail = request.get("memberEmail").toString();
            String bookTitle = request.get("bookTitle").toString();
            Integer overdueDays = Integer.valueOf(request.get("overdueDays").toString());
            if (memberId <= 0 || memberEmail.isBlank() || bookTitle.isBlank() || overdueDays < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or blank field(s) in request."));
            }
            NotificationDTO notification = notificationService.createOverdueNotification(
                    memberId, memberEmail, bookTitle, overdueDays);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input: " + e.getMessage()));
        }
    }

    @PostMapping("/fine-notice")
    @Operation(summary = "Create fine notice", description = "Create a fine notice notification")
    public ResponseEntity<?> createFineNotice(@RequestBody Map<String, Object> request) {
        if (request.get("memberId") == null || request.get("memberEmail") == null ||
            request.get("bookTitle") == null || request.get("fineAmount") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: memberId, memberEmail, bookTitle, fineAmount are required."));
        }
        try {
            Long memberId = Long.valueOf(request.get("memberId").toString());
            String memberEmail = request.get("memberEmail").toString();
            String bookTitle = request.get("bookTitle").toString();
            String fineAmount = request.get("fineAmount").toString();
            if (memberId <= 0 || memberEmail.isBlank() || bookTitle.isBlank() || fineAmount.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or blank field(s) in request."));
            }
            NotificationDTO notification = notificationService.createFineNotification(
                    memberId, memberEmail, bookTitle, fineAmount);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "Get notification statistics", description = "Retrieve notification statistics and metrics")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        Map<String, Object> stats = notificationService.getNotificationStats();
        return ResponseEntity.ok(stats);
    }
}
