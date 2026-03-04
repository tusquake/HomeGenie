package com.homegenie.notificationservice.service;

import com.homegenie.notificationservice.event.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProcessingService {

    private final EmailService emailService;

    public void processNotification(NotificationEvent event) {
        log.info("Processing notification event: type={}, recipient={}",
                event.getType(), event.getRecipientEmail());

        try {
            switch (event.getType()) {
                case "NEW_REQUEST" -> emailService.sendNewRequestNotification(
                        event.getData().get("residentName"),
                        event.getData().get("title"),
                        event.getData().get("category"),
                        event.getData().get("priority"),
                        Long.parseLong(event.getData().get("requestId")));
                case "ASSIGNMENT" -> emailService.sendAssignmentNotification(
                        event.getRecipientEmail(),
                        event.getRecipientName(),
                        event.getData().get("title"),
                        event.getData().get("category"),
                        event.getData().get("priority"),
                        Long.parseLong(event.getData().get("requestId")));
                case "STATUS_CHANGE" -> emailService.sendStatusChangeNotification(
                        event.getRecipientEmail(),
                        event.getRecipientName(),
                        event.getData().get("title"),
                        event.getData().get("oldStatus"),
                        event.getData().get("newStatus"),
                        Long.parseLong(event.getData().get("requestId")));
                case "REMINDER" -> emailService.sendReminderNotification(
                        event.getData().get("title"),
                        Long.parseLong(event.getData().get("requestId")),
                        Long.parseLong(event.getData().get("hoursPending")));
                default -> log.warn("Unknown notification type: {}", event.getType());
            }
            log.info("Notification processed successfully: type={}", event.getType());
        } catch (Exception e) {
            log.error("Failed to process notification: type={}, error={}",
                    event.getType(), e.getMessage(), e);
        }
    }
}
