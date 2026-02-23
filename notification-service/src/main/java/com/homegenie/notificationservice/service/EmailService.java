package com.homegenie.notificationservice.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.*;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.provider:smtp}")
    private String emailProvider;

    @Value("${email.from:noreply@homegenie.com}")
    private String fromEmail;

    @Value("${email.admin:admin@homegenie.com}")
    private String adminEmail;

    @Value("${aws.access-key:none}")
    private String accessKey;

    @Value("${aws.secret-key:none}")
    private String secretKey;

    @Value("${aws.region:us-east-1}")
    private String region;

    @Value("${aws.ses.from-email:noreply@homegenie.com}")
    private String sesFromEmail;

    private volatile AmazonSimpleEmailService sesClient;

    @PostConstruct
    public void init() {
        if ("ses".equalsIgnoreCase(emailProvider) && !"none".equals(accessKey)) {
            BasicAWSCredentials creds = new BasicAWSCredentials(accessKey, secretKey);
            sesClient = AmazonSimpleEmailServiceClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(creds))
                    .withRegion(Regions.fromName(region))
                    .build();
            log.info("AWS SES client initialized");
        }
    }

    public void sendNewRequestNotification(String residentName, String title,
            String category, String priority, Long requestId) {
        String subject = "New Maintenance Request - " + priority + " Priority";
        String priorityColor = getPriorityColor(priority);
        String htmlBody = String.format(
                """
                        <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
                                <h2 style="color: white; margin: 0;">HomeGenie - New Request</h2>
                            </div>
                            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
                                <p><b>Request ID:</b> #%d</p>
                                <p><b>Submitted By:</b> %s</p>
                                <p><b>Title:</b> %s</p>
                                <p><b>Category:</b> %s</p>
                                <p><b>Priority:</b> <span style="color:%s; font-weight:bold;">%s</span></p>
                            </div>
                        </body>
                        </html>
                        """,
                requestId, residentName, title, category, priorityColor, priority);
        sendEmail(adminEmail, subject, htmlBody);
    }

    public void sendAssignmentNotification(String technicianEmail, String technicianName,
            String title, String category, String priority, Long requestId) {
        String subject = "New Assignment: " + title;
        String priorityColor = getPriorityColor(priority);
        String htmlBody = String.format(
                """
                        <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
                                <h2 style="color: white; margin: 0;">Request Assigned</h2>
                            </div>
                            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
                                <p>Hello %s,</p>
                                <p>Request #%d has been assigned to you.</p>
                                <p><b>Title:</b> %s</p>
                                <p><b>Category:</b> %s</p>
                                <p><b>Priority:</b> <span style="color:%s; font-weight:bold;">%s</span></p>
                            </div>
                        </body>
                        </html>
                        """,
                technicianName, requestId, title, category, priorityColor, priority);
        sendEmail(technicianEmail, subject, htmlBody);
    }

    public void sendStatusChangeNotification(String residentEmail, String residentName,
            String title, String oldStatus, String newStatus, Long requestId) {
        String subject = "Request #" + requestId + " Status Updated";
        String htmlBody = String.format(
                """
                        <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
                                <h2 style="color: white; margin: 0;">Status Updated</h2>
                            </div>
                            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
                                <p>Hello %s,</p>
                                <p>Your request <b>%s</b> (ID #%d) has been updated:</p>
                                <p><b>%s</b> → <b>%s</b></p>
                            </div>
                        </body>
                        </html>
                        """,
                residentName, title, requestId, oldStatus, newStatus);
        sendEmail(residentEmail, subject, htmlBody);
    }

    public void sendReminderNotification(String title, Long requestId, long hoursPending) {
        String subject = "Reminder: Request #" + requestId + " pending for " + hoursPending + " hours";
        String htmlBody = String.format(
                """
                        <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #e53e3e, #c53030); padding: 20px; border-radius: 10px 10px 0 0;">
                                <h2 style="color: white; margin: 0;">Pending Request Reminder</h2>
                            </div>
                            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
                                <p>Request <b>#%d - %s</b> has been pending for <b>%d hours</b>.</p>
                                <p>Please review and take action.</p>
                            </div>
                        </body>
                        </html>
                        """,
                requestId, title, hoursPending);
        sendEmail(adminEmail, subject, htmlBody);
    }

    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            if ("ses".equalsIgnoreCase(emailProvider) && sesClient != null) {
                sendViaSES(to, subject, htmlBody);
            } else {
                sendViaSMTP(to, subject, htmlBody);
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private void sendViaSMTP(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
        log.info("SMTP email sent to {}", to);
    }

    private void sendViaSES(String to, String subject, String htmlBody) {
        SendEmailRequest request = new SendEmailRequest()
                .withDestination(new Destination().withToAddresses(to))
                .withMessage(new Message()
                        .withSubject(new Content().withCharset("UTF-8").withData(subject))
                        .withBody(new Body().withHtml(new Content().withCharset("UTF-8").withData(htmlBody))))
                .withSource(sesFromEmail);

        sesClient.sendEmail(request);
        log.info("AWS SES email sent to {}", to);
    }

    private String getPriorityColor(String priority) {
        return switch (priority) {
            case "CRITICAL" -> "#e53e3e";
            case "HIGH" -> "#ed8936";
            case "MODERATE" -> "#ecc94b";
            case "LOW" -> "#48bb78";
            default -> "#718096";
        };
    }
}
