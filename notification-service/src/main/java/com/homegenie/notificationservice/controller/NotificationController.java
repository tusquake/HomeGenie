package com.homegenie.notificationservice.controller;

import com.homegenie.notificationservice.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Slf4j
public class NotificationController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "notification-service"));
    }

    @PostMapping("/demo")
    public ResponseEntity<Map<String, String>> scheduleDemo(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String message = payload.get("message");
        String datetime = payload.get("datetime");

        log.info("Received demo request from: {}", email);

        try {
            // Send email to admin
            String safeDatetime = datetime != null ? datetime.replace("T", " ") : "Not specified";

            String adminBody = String.format(
                    "<h2>New Demo Request</h2><p><strong>Name:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>Preferred Date & Time:</strong> %s</p><p><strong>Message:</strong> %s</p>",
                    name, email, safeDatetime, message);
            emailService.sendEmail("sethtushar111@gmail.com", "New Demo Request from " + name, adminBody);

            // Send acknowledgement to user
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
