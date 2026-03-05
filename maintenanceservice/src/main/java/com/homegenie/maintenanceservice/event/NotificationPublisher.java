package com.homegenie.maintenanceservice.event;

import com.homegenie.maintenanceservice.client.NotificationClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Publishes notification events by calling the notification-service directly
 * via Feign HTTP client.
 * This replaces the previous RabbitMQ/PubSub messaging approach.
 */
@Component
@Slf4j
public class NotificationPublisher {

        @Autowired
        private NotificationClient notificationClient;

        public void publishNewRequest(String adminEmail, String residentName, String title,
                        String category, String priority, Long requestId) {
                NotificationEvent event = NotificationEvent.builder()
                                .type("NEW_REQUEST")
                                .recipientEmail(adminEmail)
                                .recipientName("Admin")
                                .subject("New Maintenance Request #" + requestId)
                                .data(Map.of(
                                                "residentName", residentName,
                                                "title", title,
                                                "category", category,
                                                "priority", priority,
                                                "requestId", String.valueOf(requestId)))
                                .build();
                send(event);
        }

        public void publishAssignment(String technicianEmail, String technicianName,
                        String title, String category, String priority, Long requestId) {
                NotificationEvent event = NotificationEvent.builder()
                                .type("ASSIGNMENT")
                                .recipientEmail(technicianEmail)
                                .recipientName(technicianName)
                                .subject("New Assignment: " + title)
                                .data(Map.of(
                                                "technicianName", technicianName,
                                                "title", title,
                                                "category", category,
                                                "priority", priority,
                                                "requestId", String.valueOf(requestId)))
                                .build();
                send(event);
        }

        public void publishStatusChange(String residentEmail, String residentName,
                        String title, String oldStatus, String newStatus, Long requestId) {
                NotificationEvent event = NotificationEvent.builder()
                                .type("STATUS_CHANGE")
                                .recipientEmail(residentEmail)
                                .recipientName(residentName)
                                .subject("Request #" + requestId + " Status Updated")
                                .data(Map.of(
                                                "residentName", residentName,
                                                "title", title,
                                                "oldStatus", oldStatus,
                                                "newStatus", newStatus,
                                                "requestId", String.valueOf(requestId)))
                                .build();
                send(event);
        }

        public void publishReminder(String adminEmail, String title, Long requestId, long hoursPending) {
                NotificationEvent event = NotificationEvent.builder()
                                .type("REMINDER")
                                .recipientEmail(adminEmail)
                                .recipientName("Admin")
                                .subject("Reminder: Request #" + requestId + " pending for " + hoursPending + " hours")
                                .data(Map.of(
                                                "title", title,
                                                "requestId", String.valueOf(requestId),
                                                "hoursPending", String.valueOf(hoursPending)))
                                .build();
                send(event);
        }

        private void send(NotificationEvent event) {
                try {
                        notificationClient.sendNotification(event);
                        log.info("Sent notification via Feign: type={}, recipient={}", event.getType(),
                                        event.getRecipientEmail());
                } catch (Exception e) {
                        log.error("Failed to send notification via Feign: type={}, error={}", event.getType(),
                                        e.getMessage(), e);
                }
        }
}
