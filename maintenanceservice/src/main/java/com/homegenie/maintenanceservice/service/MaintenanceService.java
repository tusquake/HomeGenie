package com.homegenie.maintenanceservice.service;

import com.homegenie.maintenanceservice.dto.*;
import com.homegenie.maintenanceservice.model.*;
import com.homegenie.maintenanceservice.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceService {

    private final MaintenanceRepository repository;
    private final AIClassificationService aiService;
    private final S3Service s3Service;
    private final EmailNotificationService emailService;
    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    @Transactional
    public MaintenanceResponseDTO createRequest(Long userId, MaintenanceRequestDTO dto) {
        log.info("Creating maintenance request for user: {}", userId);

        // Get user details
        UserResponse user = getUserDetails(userId);

        // AI Classification
        AIClassificationResponse aiResult = aiService.classifyRequest(dto.getTitle(), dto.getDescription());
        log.info("AI Classification - Category: {}, Priority: {}", aiResult.getCategory(), aiResult.getPriority());

        MaintenanceRequest request = new MaintenanceRequest();
        request.setUserId(userId);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCategory(aiResult.getCategory());
        request.setPriority(aiResult.getPriority());
        request.setStatus(Status.PENDING);

        // Upload image if provided
        if (dto.getImageBase64() != null && !dto.getImageBase64().isEmpty()) {
            try {
                String imageUrl = s3Service.uploadImage(dto.getImageBase64());
                request.setImageUrl(imageUrl);
            } catch (Exception e) {
                log.error("Failed to upload image, continuing without it", e);
            }
        }

        MaintenanceRequest saved = repository.save(request);

        // Send notification to admin
        try {
            emailService.notifyAdminNewRequest(
                    user.getFullName(),
                    saved.getTitle(),
                    saved.getCategory().toString(),
                    saved.getPriority().toString(),
                    saved.getId()
            );
            log.info("Admin notification sent for request ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to send admin notification", e);
        }

        return mapToResponseDTO(saved);
    }

    public List<MaintenanceResponseDTO> getAllRequests() {
        return repository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<MaintenanceResponseDTO> getRequestsByUser(Long userId) {
        return repository.findByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public MaintenanceResponseDTO getRequestById(Long id) {
        MaintenanceRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return mapToResponseDTO(request);
    }

    @Transactional
    public MaintenanceResponseDTO updateRequest(Long id, UpdateRequestDTO dto) {
        MaintenanceRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Status oldStatus = request.getStatus();

        if (dto.getStatus() != null) {
            request.setStatus(dto.getStatus());
            if (dto.getStatus() == Status.COMPLETED) {
                request.setResolvedAt(LocalDateTime.now());
            }
        }

        if (dto.getAssignedTo() != null) {
            request.setAssignedTo(dto.getAssignedTo());
            if (request.getStatus() == Status.PENDING) {
                request.setStatus(Status.IN_PROGRESS);
            }

            // Send notification to technician
            try {
                UserResponse technician = getUserDetails(dto.getAssignedTo());
                emailService.notifyTechnicianAssignment(
                        technician.getEmail(),
                        technician.getFullName(),
                        request.getTitle(),
                        request.getCategory().toString(),
                        request.getPriority().toString(),
                        request.getId()
                );
                log.info("Technician notification sent to: {}", technician.getEmail());
            } catch (Exception e) {
                log.error("Failed to send technician notification", e);
            }
        }

        if (dto.getAdminNotes() != null) {
            request.setAdminNotes(dto.getAdminNotes());
        }

        request.setUpdatedAt(LocalDateTime.now());

        MaintenanceRequest updated = repository.save(request);

        // Send status change notification to resident if status changed
        if (oldStatus != updated.getStatus()) {
            try {
                UserResponse resident = getUserDetails(updated.getUserId());
                emailService.notifyResidentStatusChange(
                        resident.getEmail(),
                        resident.getFullName(),
                        updated.getTitle(),
                        oldStatus.toString(),
                        updated.getStatus().toString(),
                        updated.getId()
                );
                log.info("Status change notification sent to resident: {}", resident.getEmail());
            } catch (Exception e) {
                log.error("Failed to send status change notification", e);
            }
        }

        return mapToResponseDTO(updated);
    }

    public UserResponse getUserDetails(Long userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId;

            log.info("Fetching user details from: {}", url);

            UserResponse user = restTemplate.getForObject(url, UserResponse.class);

            if (user != null) {
                log.info("User details retrieved successfully: ID={}, Name={}, Email={}",
                        user.getId(), user.getFullName(), user.getEmail());
            } else {
                log.warn("No user found for ID: {}", userId);
            }

            return user;

        } catch (Exception e) {
            log.error("Failed to get user details for userId: {}", userId, e);

            UserResponse dummy = new UserResponse();
            dummy.setId(userId);
            dummy.setEmail("unknown@example.com");
            dummy.setFullName("Unknown User");

            log.info("Returning dummy user details for ID: {}", userId);
            return dummy;
        }
    }

    @Transactional
    public void deleteRequest(Long id) {
        MaintenanceRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getImageUrl() != null) {
            try {
                s3Service.deleteImage(request.getImageUrl());
            } catch (Exception e) {
                log.error("Failed to delete image", e);
            }
        }

        repository.deleteById(id);
    }

    public Map<String, Long> getStatistics() {
        List<MaintenanceRequest> all = repository.findAll();

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) all.size());
        stats.put("pending", all.stream().filter(r -> r.getStatus() == Status.PENDING).count());
        stats.put("inProgress", all.stream().filter(r -> r.getStatus() == Status.IN_PROGRESS).count());
        stats.put("completed", all.stream().filter(r -> r.getStatus() == Status.COMPLETED).count());
        stats.put("critical", all.stream().filter(r -> r.getPriority() == Priority.CRITICAL).count());

        return stats;
    }

    private MaintenanceResponseDTO mapToResponseDTO(MaintenanceRequest request) {
        MaintenanceResponseDTO dto = new MaintenanceResponseDTO();
        dto.setId(request.getId());
        dto.setUserId(request.getUserId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setCategory(request.getCategory());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setImageUrl(request.getImageUrl());
        dto.setAssignedTo(request.getAssignedTo());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setResolvedAt(request.getResolvedAt());
        dto.setAdminNotes(request.getAdminNotes());
        return dto;
    }
}