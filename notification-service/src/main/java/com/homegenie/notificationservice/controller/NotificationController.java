package com.homegenie.notificationservice.controller;

import com.homegenie.notificationservice.event.NotificationEvent;
import com.homegenie.notificationservice.service.EmailService;
import com.homegenie.notificationservice.service.NotificationProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Slf4j
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;
    private final NotificationProcessingService notificationProcessingService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "notification-service"));
    }

    /**
     * Direct HTTP endpoint for sending notifications.
     * Used by other services (e.g. maintenance-service) via Feign client
     * instead of going through a message broker (RabbitMQ/PubSub).
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendNotification(@RequestBody NotificationEvent event) {
        log.info("Received direct notification request: type={}, recipient={}", event.getType(),
                event.getRecipientEmail());
        try {
            notificationProcessingService.processNotification(event);
            return ResponseEntity.ok(Map.of("status", "sent", "type", event.getType()));
        } catch (Exception e) {
            log.error("Failed to process notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/demo")
    public ResponseEntity<Map<String, String>> scheduleDemo(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String message = payload.get("message");
        String datetime = payload.get("datetime");

        log.info("Received demo request from: {}", email);
        String safeDatetime = datetime != null ? datetime.replace("T", " ") : "Not specified";

        // Send emails — failures are non-fatal; the demo request is still registered
        try {
            String adminBody = String.format(
                    """
                            <html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
                            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
                              <tr><td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                  <tr><td style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:28px 32px;">
                                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🏠 HomeGenie</h1>
                                    <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">New Demo Request — Internal Notification</p>
                                  </td></tr>
                                  <tr><td style="padding:32px;">
                                    <h2 style="margin:0 0 20px;color:#1e293b;font-size:18px;">A new demo has been requested</h2>
                                    <table width="100%%" cellpadding="0" cellspacing="0">
                                      <tr><td style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:6px;padding:14px 18px;margin-bottom:12px;">
                                        <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Name</p>
                                        <p style="margin:0;font-size:16px;color:#0f172a;font-weight:600;">%s</p>
                                      </td></tr>
                                      <tr><td style="height:10px;"></td></tr>
                                      <tr><td style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:6px;padding:14px 18px;">
                                        <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Email</p>
                                        <p style="margin:0;font-size:16px;color:#0f172a;font-weight:600;">%s</p>
                                      </td></tr>
                                      <tr><td style="height:10px;"></td></tr>
                                      <tr><td style="background:#f8fafc;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 18px;">
                                        <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Preferred Date &amp; Time</p>
                                        <p style="margin:0;font-size:16px;color:#0f172a;font-weight:600;">%s</p>
                                      </td></tr>
                                      <tr><td style="height:10px;"></td></tr>
                                      <tr><td style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:6px;padding:14px 18px;">
                                        <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Message</p>
                                        <p style="margin:0;font-size:15px;color:#334155;">%s</p>
                                      </td></tr>
                                    </table>
                                  </td></tr>
                                  <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                                    <p style="margin:0;font-size:12px;color:#94a3b8;">HomeGenie Internal — Demo Pipeline</p>
                                  </td></tr>
                                </table>
                              </td></tr>
                            </table>
                            </body></html>
                            """,
                    name, email, safeDatetime, message != null && !message.isBlank() ? message : "—");
            emailService.sendEmail("sethtushar111@gmail.com", "🏠 New Demo Request from " + name, adminBody);
        } catch (Exception e) {
            log.error("Failed to send admin notification for demo request from {}: {}", email, e.getMessage());
        }

        try {
            String userBody = String.format(
                    """
                            <html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
                            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
                              <tr><td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                  <tr><td style="background:linear-gradient(135deg,#1d4ed8,#6366f1);padding:36px 32px;text-align:center;">
                                    <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🏠 HomeGenie</h1>
                                    <p style="margin:8px 0 0;color:#c7d2fe;font-size:15px;">Smart Home Management Platform</p>
                                  </td></tr>
                                  <tr><td style="padding:36px 32px;">
                                    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Demo Request Confirmed ✅</h2>
                                    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>%s</strong>, thank you for your interest in HomeGenie! We've received your demo request and our team will reach out shortly to confirm your session.</p>
                                    <div style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border:1px solid #c7d2fe;border-radius:10px;padding:24px;">
                                      <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;color:#6366f1;font-weight:700;letter-spacing:1px;">📅 Your Requested Slot</p>
                                      <p style="margin:0;font-size:20px;font-weight:700;color:#1e293b;">%s</p>
                                    </div>
                                    <div style="margin:28px 0;border-left:4px solid #3b82f6;padding:14px 18px;background:#f8fafc;border-radius:0 8px 8px 0;">
                                      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">🔍 During the demo, we'll walk you through resident management, maintenance request workflows, AI-powered voice commands, and real-time analytics — tailored to your property needs.</p>
                                    </div>
                                    <p style="margin:0;color:#64748b;font-size:14px;">Have questions in the meantime? Just reply to this email.</p>
                                  </td></tr>
                                  <tr><td style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:24px 32px;text-align:center;">
                                    <p style="margin:0 0 6px;color:#94a3b8;font-size:13px;">© 2025 HomeGenie · Smart Home Management</p>
                                    <p style="margin:0;color:#475569;font-size:12px;">You're receiving this because you requested a demo at homegenie-729738921708.asia-south1.run.app</p>
                                  </td></tr>
                                </table>
                              </td></tr>
                            </table>
                            </body></html>
                            """,
                    name, safeDatetime);
            emailService.sendEmail(email, "HomeGenie Demo Request Confirmation", userBody);
        } catch (Exception e) {
            log.error("Failed to send confirmation email to {}: {}", email, e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Demo request received successfully! We will be in touch shortly."));
    }
}
