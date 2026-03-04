package com.homegenie.notificationservice.consumer;

import com.homegenie.notificationservice.config.PubSubConfig;
import com.homegenie.notificationservice.event.NotificationEvent;
import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import com.google.cloud.spring.pubsub.support.converter.JacksonPubSubMessageConverter;
import com.homegenie.notificationservice.service.NotificationProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class PubSubNotificationConsumer {

    private final PubSubTemplate pubSubTemplate;
    private final NotificationProcessingService notificationProcessingService;
    private final JacksonPubSubMessageConverter messageConverter;

    @EventListener(ApplicationReadyEvent.class)
    public void subscribe() {
        log.info("Subscribing to GCP Pub/Sub subscription: {}", PubSubConfig.NOTIFICATION_SUBSCRIPTION);
        pubSubTemplate.subscribe(PubSubConfig.NOTIFICATION_SUBSCRIPTION, (message) -> {
            try {
                NotificationEvent event = messageConverter.fromPubSubMessage(
                        message.getPubsubMessage(), NotificationEvent.class);
                log.info("Received notification event from Pub/Sub: type={}", event.getType());
                notificationProcessingService.processNotification(event);
                message.ack();
            } catch (Exception e) {
                log.error("Failed to process Pub/Sub message: {}", e.getMessage(), e);
                // Nack if it's a transient failure, or just log and ack if it's consistently
                // bad
                message.nack();
            }
        });
    }
}
