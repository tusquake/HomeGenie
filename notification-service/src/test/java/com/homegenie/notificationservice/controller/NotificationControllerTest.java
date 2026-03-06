package com.homegenie.notificationservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homegenie.notificationservice.event.NotificationEvent;
import com.homegenie.notificationservice.service.EmailService;
import com.homegenie.notificationservice.service.NotificationProcessingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
public class NotificationControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private EmailService emailService;

        @MockBean
        private NotificationProcessingService notificationProcessingService;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        void testHealthEndpoint() throws Exception {
                mockMvc.perform(get("/api/notifications/health"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("UP"))
                                .andExpect(jsonPath("$.service").value("notification-service"));
        }

        @Test
        void testSendNotification_Success() throws Exception {
                NotificationEvent event = NotificationEvent.builder()
                                .type("NEW_REQUEST")
                                .recipientEmail("admin@example.com")
                                .recipientName("Admin")
                                .subject("New Maintenance Request #1")
                                .data(Map.of("requestId", "1", "title", "Leaking Pipe",
                                                "category", "PLUMBING", "priority", "HIGH", "residentName", "John Doe"))
                                .build();

                doNothing().when(notificationProcessingService).processNotification(any(NotificationEvent.class));

                mockMvc.perform(post("/api/notifications/send")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("sent"))
                                .andExpect(jsonPath("$.type").value("NEW_REQUEST"));

                verify(notificationProcessingService, times(1)).processNotification(any(NotificationEvent.class));
        }

        @Test
        void testSendNotification_ProcessingFails_Returns500() throws Exception {
                NotificationEvent event = NotificationEvent.builder()
                                .type("STATUS_CHANGE")
                                .recipientEmail("user@example.com")
                                .recipientName("Test User")
                                .subject("Status Updated")
                                .data(Map.of("requestId", "1", "title", "Leaking Pipe",
                                                "oldStatus", "PENDING", "newStatus", "COMPLETED", "residentName",
                                                "Test User"))
                                .build();

                doThrow(new RuntimeException("Email server unavailable"))
                                .when(notificationProcessingService).processNotification(any(NotificationEvent.class));

                mockMvc.perform(post("/api/notifications/send")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(event)))
                                .andExpect(status().isInternalServerError())
                                .andExpect(jsonPath("$.error").exists());
        }

        @Test
        void testScheduleDemo() throws Exception {
                Map<String, String> payload = new HashMap<>();
                payload.put("name", "John Doe");
                payload.put("email", "john@example.com");
                payload.put("message", "I am interested.");
                payload.put("datetime", "2026-03-01T10:00");

                doNothing().when(emailService).sendEmail(anyString(), anyString(), anyString());

                mockMvc.perform(post("/api/notifications/demo")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(payload)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value(
                                                "Demo request received successfully! We will be in touch shortly."));

                verify(emailService, times(2)).sendEmail(anyString(), anyString(), anyString());
        }
}
