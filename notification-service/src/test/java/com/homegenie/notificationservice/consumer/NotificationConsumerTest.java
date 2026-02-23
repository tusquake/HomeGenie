package com.homegenie.notificationservice.consumer;

import com.homegenie.notificationservice.event.NotificationEvent;
import com.homegenie.notificationservice.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationConsumerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @Test
    void testHandleNewRequestNotification() {
        NotificationEvent event = NotificationEvent.builder()
                .type("NEW_REQUEST")
                .data(Map.of(
                        "residentName", "Resident A",
                        "title", "Broken AC",
                        "category", "HVAC",
                        "priority", "HIGH",
                        "requestId", "456"))
                .build();

        notificationConsumer.handleNotification(event);

        verify(emailService, times(1)).sendNewRequestNotification("Resident A", "Broken AC", "HVAC", "HIGH", 456L);
    }

    @Test
    void testHandleAssignmentNotification() {
        NotificationEvent event = NotificationEvent.builder()
                .type("ASSIGNMENT")
                .recipientEmail("tech@test.com")
                .recipientName("Tech A")
                .data(Map.of(
                        "title", "Broken AC",
                        "category", "HVAC",
                        "priority", "HIGH",
                        "requestId", "456"))
                .build();

        notificationConsumer.handleNotification(event);

        verify(emailService, times(1)).sendAssignmentNotification("tech@test.com", "Tech A", "Broken AC", "HVAC",
                "HIGH", 456L);
    }
}
