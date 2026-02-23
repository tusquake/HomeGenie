package com.homegenie.notificationservice.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.lang.reflect.Field;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() throws Exception {
        setPrivateField(emailService, "emailProvider", "smtp");
        setPrivateField(emailService, "fromEmail", "test@test.com");
        setPrivateField(emailService, "adminEmail", "admin@test.com");
    }

    private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void testSendNewRequestNotification() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendNewRequestNotification("Resident A", "Fix Sink", "Plumbing", "HIGH", 123L);

        verify(mailSender, times(1)).send(mimeMessage);
    }

    @Test
    void testSendAssignmentNotification() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendAssignmentNotification("tech@test.com", "Tech A", "Fix Sink", "Plumbing", "HIGH", 123L);

        verify(mailSender, times(1)).send(mimeMessage);
    }
}
