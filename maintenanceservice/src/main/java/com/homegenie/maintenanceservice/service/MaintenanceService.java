package com.homegenie.maintenanceservice.service;

import com.homegenie.maintenanceservice.dto.*;
import com.homegenie.maintenanceservice.event.NotificationPublisher;
import com.homegenie.maintenanceservice.exception.ResourceNotFoundException;
import com.homegenie.maintenanceservice.exception.ServiceUnavailableException;
import com.homegenie.maintenanceservice.model.*;
import com.homegenie.maintenanceservice.repository.MaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final StorageService storageService;
    private final NotificationPublisher notificationPublisher;
    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${admin.email:admin@homegenie.com}")
    private String adminEmail;

    @Transactional
    @CacheEvict(value = "statistics", allEntries = true)
    public MaintenanceResponseDTO createRequest(Long userId, MaintenanceRequestDTO dto) {
        log.info("Creating maintenance request for user: {}", userId);

        UserResponse user = getUserDetails(userId);

        AIClassificationResponse aiResult = aiService.classifyRequest(dto.getTitle(), dto.getDescription());
        log.info("AI Classification - Category: {}, Priority: {}", aiResult.getCategory(), aiResult.getPriority());

        MaintenanceRequest request = new MaintenanceRequest();
        request.setUserId(userId);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCategory(aiResult.getCategory());
        request.setPriority(aiResult.getPriority());
        request.setStatus(Status.PENDING);

        if (dto.getImageBase64() != null && !dto.getImageBase64().isEmpty()) {
            try {
                String imageUrl = storageService.uploadImage(dto.getImageBase64());
                request.setImageUrl(imageUrl);
            } catch (Exception e) {
                log.error("Failed to upload image, continuing without it", e);
            }
        }

        MaintenanceRequest saved = repository.save(request);

        try {
            notificationPublisher.publishNewRequest(
                    adminEmail,
                    user.getFullName(),
                    saved.getTitle(),
                    saved.getCategory().toString(),
                    saved.getPriority().toString(),
                    saved.getId());
            log.info("New request notification published for request ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to publish new request notification", e);
        }

        return mapToResponseDTO(saved);
    }

    public Page<MaintenanceResponseDTO> getAllRequests(Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToResponseDTO);
    }

    public List<MaintenanceResponseDTO> getRequestsByUser(Long userId) {
        return repository.findByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<MaintenanceResponseDTO> getRequestsByTechnician(Long technicianId) {
        return repository.findByAssignedTo(technicianId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public MaintenanceResponseDTO getRequestById(Long id) {
        MaintenanceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));
        return mapToResponseDTO(request);
    }

    @Transactional
    @CacheEvict(value = "statistics", allEntries = true)
    public MaintenanceResponseDTO updateRequest(Long id, UpdateRequestDTO dto) {
        log.info("Updating maintenance request ID: {}", id);

        MaintenanceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));

        Status oldStatus = request.getStatus();
        Long oldAssignedTo = request.getAssignedTo();

        if (dto.getStatus() != null) {
            log.info("Updating status from {} to {}", oldStatus, dto.getStatus());
            request.setStatus(dto.getStatus());
            if (dto.getStatus() == Status.COMPLETED) {
                request.setResolvedAt(LocalDateTime.now());
            }
        }

        if (dto.getAssignedTo() != null && !dto.getAssignedTo().equals(oldAssignedTo)) {
            log.info("Assigning technician ID: {} to request ID: {}", dto.getAssignedTo(), id);
            request.setAssignedTo(dto.getAssignedTo());

            if (request.getStatus() == Status.PENDING) {
                request.setStatus(Status.IN_PROGRESS);
            }

            try {
                UserResponse technician = getUserDetails(dto.getAssignedTo());
                notificationPublisher.publishAssignment(
                        technician.getEmail(),
                        technician.getFullName(),
                        request.getTitle(),
                        request.getCategory().toString(),
                        request.getPriority().toString(),
                        request.getId());
                log.info("Assignment notification published for technician: {}", technician.getEmail());
            } catch (Exception e) {
                log.error("Failed to publish assignment notification: {}", e.getMessage());
            }
        }

        if (dto.getAdminNotes() != null) {
            request.setAdminNotes(dto.getAdminNotes());
        }

        MaintenanceRequest updated = repository.save(request);

        if (oldStatus != updated.getStatus()) {
            try {
                UserResponse resident = getUserDetails(updated.getUserId());
                notificationPublisher.publishStatusChange(
                        resident.getEmail(),
                        resident.getFullName(),
                        updated.getTitle(),
                        oldStatus.toString(),
                        updated.getStatus().toString(),
                        updated.getId());
                log.info("Status change notification published for resident: {}", resident.getEmail());
            } catch (Exception e) {
                log.error("Failed to publish status change notification", e);
            }
        }

        return mapToResponseDTO(updated);
    }

    public UserResponse getUserDetails(Long userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId;
            log.info("Fetching user details from: {}", url);

            UserResponse user = restTemplate.getForObject(url, UserResponse.class);

            if (user == null) {
                throw new ResourceNotFoundException("User not found with id: " + userId);
            }

            return user;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to get user details for userId: {}", userId, e);
            throw new ServiceUnavailableException("User service is unavailable", e);
        }
    }

    @Transactional
    @CacheEvict(value = "statistics", allEntries = true)
    public void deleteRequest(Long id) {
        MaintenanceRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance request not found with id: " + id));

        if (request.getImageUrl() != null) {
            try {
                storageService.deleteImage(request.getImageUrl());
            } catch (Exception e) {
                log.error("Failed to delete image", e);
            }
        }

        repository.deleteById(id);
    }

    @Cacheable(value = "statistics")
    public Map<String, Long> getStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", repository.count());
        stats.put("pending", repository.countByStatus(Status.PENDING));
        stats.put("inProgress", repository.countByStatus(Status.IN_PROGRESS));
        stats.put("completed", repository.countByStatus(Status.COMPLETED));
        stats.put("critical", repository.countByPriority(Priority.CRITICAL));
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

    @Cacheable(value = "technicians")
    public List<UserResponse> getAllTechnicians() {
        try {
            String url = userServiceUrl + "/api/users/technicians";
            log.info("Fetching all technicians from User Service: {}", url);

            UserResponse[] response = restTemplate.getForObject(url, UserResponse[].class);

            if (response == null) {
                return List.of();
            }

            log.info("Successfully fetched {} technicians", response.length);
            return List.of(response);
        } catch (Exception e) {
            log.error("Failed to fetch technicians from User Service", e);
            throw new ServiceUnavailableException("User service is unavailable", e);
        }
    }
}