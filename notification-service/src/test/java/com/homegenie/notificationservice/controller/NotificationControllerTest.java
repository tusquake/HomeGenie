package com.homegenie.notificationservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homegenie.notificationservice.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
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
                .andExpect(jsonPath("$.message").value("Demo request processed successfully"));

        verify(emailService, org.mockito.Mockito.times(2)).sendEmail(anyString(), anyString(), anyString());
    }
}
