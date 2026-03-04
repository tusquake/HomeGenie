package com.homegenie.maintenanceservice.event;

import com.homegenie.maintenanceservice.config.RabbitMQConfig;
import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import com.homegenie.maintenanceservice.config.PubSubConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

        private final Optional<RabbitTemplate> rabbitTemplate;
        private final Optional<PubSubTemplate> pubSubTemplate;

        @Value("${spring.profiles.active:default}")
        private String activeProfile;

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

                publish(event, RabbitMQConfig.ROUTING_KEY_NEW_REQUEST);
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

                publish(event, RabbitMQConfig.ROUTING_KEY_ASSIGNMENT);
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

                publish(event, RabbitMQConfig.ROUTING_KEY_STATUS_CHANGE);
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

                publish(event, RabbitMQConfig.ROUTING_KEY_REMINDER);
        }

        private void publish(NotificationEvent event, String routingKey) {
                try {
                        if (activeProfile.contains("prod") && pubSubTemplate.isPresent()) {
                                pubSubTemplate.get().publish(PubSubConfig.NOTIFICATION_TOPIC, event);
                                log.info("Published notification event to Pub/Sub: type={}, recipient={}",
                                                event.getType(), event.getRecipientEmail());
                        } else if (rabbitTemplate.isPresent()) {
                                rabbitTemplate.get().convertAndSend(
                                                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                                                routingKey,
                                                event);
                                log.info("Published notification event to RabbitMQ: type={}, recipient={}, routingKey={}",
                                                event.getType(), event.getRecipientEmail(), routingKey);
                        } else {
                                log.warn("No messaging template available to publish event: type={}", event.getType());
                        }
                } catch (Exception e) {
                        log.error("Failed to publish notification event: {}", e.getMessage(), e);
                }
        }
}
