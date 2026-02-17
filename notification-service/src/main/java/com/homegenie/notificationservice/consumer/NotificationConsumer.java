package com.homegenie.notificationservice.consumer;

import com.homegenie.notificationservice.config.RabbitMQConfig;
import com.homegenie.notificationservice.event.NotificationEvent;
import com.homegenie.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void handleNotification(NotificationEvent event) {
        log.info("Received notification event: type={}, recipient={}",
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
