package com.homegenie.maintenanceservice.event;

import com.homegenie.maintenanceservice.client.NotificationClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationPublisher Tests")
class NotificationPublisherTest {

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private NotificationPublisher notificationPublisher;

    @BeforeEach
    void setUp() {
        lenient().when(notificationClient.sendNotification(any(NotificationEvent.class)))
                .thenReturn(ResponseEntity.ok(Map.of("status", "sent")));
    }

    @Test
    @DisplayName("Should send NEW_REQUEST notification via Feign client")
    void publishNewRequest_SendsCorrectEvent() {
        notificationPublisher.publishNewRequest(
                "admin@example.com", "John Doe", "Leaking Pipe", "PLUMBING", "HIGH", 1L);

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(notificationClient, times(1)).sendNotification(captor.capture());

        NotificationEvent captured = captor.getValue();
        assertThat(captured.getType()).isEqualTo("NEW_REQUEST");
        assertThat(captured.getRecipientEmail()).isEqualTo("admin@example.com");
        assertThat(captured.getData().get("residentName")).isEqualTo("John Doe");
        assertThat(captured.getData().get("requestId")).isEqualTo("1");
    }

    @Test
    @DisplayName("Should send ASSIGNMENT notification via Feign client")
    void publishAssignment_SendsCorrectEvent() {
        notificationPublisher.publishAssignment(
                "tech@example.com", "Tech User", "Leaking Pipe", "PLUMBING", "HIGH", 2L);

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(notificationClient, times(1)).sendNotification(captor.capture());

        NotificationEvent captured = captor.getValue();
        assertThat(captured.getType()).isEqualTo("ASSIGNMENT");
        assertThat(captured.getRecipientEmail()).isEqualTo("tech@example.com");
        assertThat(captured.getRecipientName()).isEqualTo("Tech User");
        assertThat(captured.getData().get("requestId")).isEqualTo("2");
    }

    @Test
    @DisplayName("Should send STATUS_CHANGE notification via Feign client")
    void publishStatusChange_SendsCorrectEvent() {
        notificationPublisher.publishStatusChange(
                "user@example.com", "Test User", "Leaking Pipe", "PENDING", "COMPLETED", 3L);

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(notificationClient, times(1)).sendNotification(captor.capture());

        NotificationEvent captured = captor.getValue();
        assertThat(captured.getType()).isEqualTo("STATUS_CHANGE");
        assertThat(captured.getData().get("oldStatus")).isEqualTo("PENDING");
        assertThat(captured.getData().get("newStatus")).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("Should send REMINDER notification via Feign client")
    void publishReminder_SendsCorrectEvent() {
        notificationPublisher.publishReminder("admin@example.com", "Leaking Pipe", 4L, 48L);

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(notificationClient, times(1)).sendNotification(captor.capture());

        NotificationEvent captured = captor.getValue();
        assertThat(captured.getType()).isEqualTo("REMINDER");
        assertThat(captured.getData().get("hoursPending")).isEqualTo("48");
        assertThat(captured.getSubject()).contains("48 hours");
    }

    @Test
    @DisplayName("Should not throw exception when Feign client fails")
    void publish_WhenFeignClientFails_DoesNotThrow() {
        when(notificationClient.sendNotification(any(NotificationEvent.class)))
                .thenThrow(new RuntimeException("notification-service is down"));

        // Should silently log the error and not propagate the exception
        notificationPublisher.publishNewRequest(
                "admin@example.com", "John Doe", "Broken Heater", "HVAC", "HIGH", 5L);

        verify(notificationClient, times(1)).sendNotification(any(NotificationEvent.class));
    }
}
