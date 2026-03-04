package com.homegenie.notificationservice.consumer;

import com.homegenie.notificationservice.config.RabbitMQConfig;
import com.homegenie.notificationservice.event.NotificationEvent;
import com.homegenie.notificationservice.service.NotificationProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

        private final NotificationProcessingService notificationProcessingService;

        @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
        public void handleNotification(NotificationEvent event) {
                notificationProcessingService.processNotification(event);
        }
}
