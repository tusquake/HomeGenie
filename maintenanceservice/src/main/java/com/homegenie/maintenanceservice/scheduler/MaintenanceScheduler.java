package com.homegenie.maintenanceservice.scheduler;

import com.homegenie.maintenanceservice.event.NotificationPublisher;
import com.homegenie.maintenanceservice.model.MaintenanceRequest;
import com.homegenie.maintenanceservice.model.Status;
import com.homegenie.maintenanceservice.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceScheduler {

    private final MaintenanceRepository repository;
    private final NotificationPublisher notificationPublisher;

    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void checkPendingRequests() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<MaintenanceRequest> pendingRequests = repository.findByStatusAndCreatedAtBefore(Status.PENDING, cutoff);

        log.info("Found {} pending requests older than 24 hours", pendingRequests.size());

        for (MaintenanceRequest request : pendingRequests) {
            // Skip if reminder was sent within the last 24 hours
            if (request.getLastReminderSentAt() != null
                    && request.getLastReminderSentAt().isAfter(LocalDateTime.now().minusHours(24))) {
                continue;
            }

            long hoursPending = Duration.between(request.getCreatedAt(), LocalDateTime.now()).toHours();

            try {
                notificationPublisher.publishReminder(
                        "admin@homegenie.com",
                        request.getTitle(),
                        request.getId(),
                        hoursPending);
                request.setLastReminderSentAt(LocalDateTime.now());
                repository.save(request);
                log.info("Reminder published for request #{} (pending {} hours)", request.getId(), hoursPending);
            } catch (Exception e) {
                log.error("Failed to publish reminder for request #{}", request.getId(), e);
            }
        }
    }
}