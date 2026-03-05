package com.homegenie.notificationservice.controller;

import com.homegenie.notificationservice.event.NotificationEvent;
import com.homegenie.notificationservice.service.EmailService;
import com.homegenie.notificationservice.service.NotificationProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Slf4j
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;
    private final NotificationProcessingService notificationProcessingService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "notification-service"));
    }

    /**
     * Direct HTTP endpoint for sending notifications.
     * Used by other services (e.g. maintenance-service) via Feign client
     * instead of going through a message broker (RabbitMQ/PubSub).
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendNotification(@RequestBody NotificationEvent event) {
        log.info("Received direct notification request: type={}, recipient={}", event.getType(),
                event.getRecipientEmail());
        try {
            notificationProcessingService.processNotification(event);
            return ResponseEntity.ok(Map.of("status", "sent", "type", event.getType()));
        } catch (Exception e) {
            log.error("Failed to process notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/demo")
    public ResponseEntity<Map<String, String>> scheduleDemo(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String message = payload.get("message");
        String datetime = payload.get("datetime");

        log.info("Received demo request from: {}", email);

        try {
            String safeDatetime = datetime != null ? datetime.replace("T", " ") : "Not specified";

            String adminBody = String.format(
                    "<h2>New Demo Request</h2><p><strong>Name:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>Preferred Date &amp; Time:</strong> %s</p><p><strong>Message:</strong> %s</p>",
                    name, email, safeDatetime, message);
            emailService.sendEmail("sethtushar111@gmail.com", "New Demo Request from " + name, adminBody);

            String userBody = String.format(
                    "<h2>Demo Request Received</h2><p>Hi %s,</p><p>Thank you for your interest in HomeGenie! We have received your demo request for <strong>%s</strong>. We will be in touch shortly to confirm this time.</p><p>Best,<br>The HomeGenie Team</p>",
                    name, safeDatetime);
            emailService.sendEmail(email, "HomeGenie Demo Request Confirmation", userBody);

            return ResponseEntity.ok(Map.of("message", "Demo request processed successfully"));
        } catch (Exception e) {
            log.error("Failed to process demo request", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to process request"));
        }
    }
}
