package com.homegenie.maintenanceservice.client;

import com.homegenie.maintenanceservice.event.NotificationEvent;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client for direct HTTP communication with the notification-service.
 * Used instead of RabbitMQ/PubSub for simplified deployment without a message
 * broker.
 */
@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationClient {

    @PostMapping("/api/notifications/send")
    ResponseEntity<Map<String, String>> sendNotification(@RequestBody NotificationEvent event);
}
