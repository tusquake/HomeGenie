package com.homegenie.maintenanceservice.service;

import com.homegenie.maintenanceservice.dto.*;
import com.homegenie.maintenanceservice.event.NotificationPublisher;
import com.homegenie.maintenanceservice.exception.ResourceNotFoundException;
import com.homegenie.maintenanceservice.exception.ServiceUnavailableException;
import com.homegenie.maintenanceservice.model.*;
import com.homegenie.maintenanceservice.repository.MaintenanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository repository;

    @Mock
    private AIClassificationService aiService;

    @Mock
    private S3Service s3Service;

    @Mock
    private NotificationPublisher notificationPublisher;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private MaintenanceRequest testRequest;
    private MaintenanceRequestDTO requestDTO;
    private UserResponse testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(maintenanceService, "userServiceUrl", "http://localhost:8081");

        testRequest = new MaintenanceRequest();
        testRequest.setId(1L);
        testRequest.setUserId(1L);
        testRequest.setTitle("Leaking Pipe");
        testRequest.setDescription("Kitchen pipe is leaking");
        testRequest.setCategory(Category.PLUMBING);
        testRequest.setPriority(Priority.HIGH);
        testRequest.setStatus(Status.PENDING);
        testRequest.setCreatedAt(LocalDateTime.now());

        requestDTO = new MaintenanceRequestDTO();
        requestDTO.setTitle("Leaking Pipe");
        requestDTO.setDescription("Kitchen pipe is leaking");

        testUser = new UserResponse();
        testUser.setId(1L);
        testUser.setEmail("user@example.com");
        testUser.setFullName("Test User");
        testUser.setRole("RESIDENT");
    }

    @Nested
    @DisplayName("Create Request Tests")
    class CreateRequestTests {

        @Test
        @DisplayName("Should create request with AI classification")
        void createRequest_Success() {
            AIClassificationResponse aiResult = new AIClassificationResponse();
            aiResult.setCategory(Category.PLUMBING);
            aiResult.setPriority(Priority.HIGH);

            when(restTemplate.getForObject(anyString(), eq(UserResponse.class))).thenReturn(testUser);
            when(aiService.classifyRequest(anyString(), anyString())).thenReturn(aiResult);
            when(repository.save(any(MaintenanceRequest.class))).thenReturn(testRequest);

            MaintenanceResponseDTO response = maintenanceService.createRequest(1L, requestDTO);

            assertThat(response.getTitle()).isEqualTo("Leaking Pipe");
            assertThat(response.getCategory()).isEqualTo(Category.PLUMBING);
            assertThat(response.getPriority()).isEqualTo(Priority.HIGH);
            assertThat(response.getStatus()).isEqualTo(Status.PENDING);
            verify(notificationPublisher).publishNewRequest(
                    anyString(), anyString(), anyString(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("Should create request with image upload")
        void createRequest_WithImage() {
            requestDTO.setImageBase64("base64EncodedImage");
            AIClassificationResponse aiResult = new AIClassificationResponse();
            aiResult.setCategory(Category.PLUMBING);
            aiResult.setPriority(Priority.HIGH);

            testRequest.setImageUrl("https://bucket/image.jpg");

            when(restTemplate.getForObject(anyString(), eq(UserResponse.class))).thenReturn(testUser);
            when(aiService.classifyRequest(anyString(), anyString())).thenReturn(aiResult);
            when(s3Service.uploadImage(anyString())).thenReturn("https://bucket/image.jpg");
            when(repository.save(any(MaintenanceRequest.class))).thenReturn(testRequest);

            MaintenanceResponseDTO response = maintenanceService.createRequest(1L, requestDTO);

            assertThat(response.getImageUrl()).isEqualTo("https://bucket/image.jpg");
            verify(s3Service).uploadImage("base64EncodedImage");
        }

        @Test
        @DisplayName("Should continue without image if upload fails")
        void createRequest_ImageUploadFails() {
            requestDTO.setImageBase64("invalid_base64");
            AIClassificationResponse aiResult = new AIClassificationResponse();
            aiResult.setCategory(Category.PLUMBING);
            aiResult.setPriority(Priority.LOW);

            when(restTemplate.getForObject(anyString(), eq(UserResponse.class))).thenReturn(testUser);
            when(aiService.classifyRequest(anyString(), anyString())).thenReturn(aiResult);
            when(s3Service.uploadImage(anyString())).thenThrow(new RuntimeException("Upload failed"));
            when(repository.save(any(MaintenanceRequest.class))).thenReturn(testRequest);

            MaintenanceResponseDTO response = maintenanceService.createRequest(1L, requestDTO);

            assertThat(response).isNotNull();
        }
    }

    @Nested
    @DisplayName("Retrieve Request Tests")
    class RetrieveTests {

        @Test
        @DisplayName("Should get request by ID")
        void getRequestById_Success() {
            when(repository.findById(1L)).thenReturn(Optional.of(testRequest));

            MaintenanceResponseDTO response = maintenanceService.getRequestById(1L);

            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getTitle()).isEqualTo("Leaking Pipe");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for unknown ID")
        void getRequestById_NotFound() {
            when(repository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> maintenanceService.getRequestById(99L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Maintenance request not found");
        }

        @Test
        @DisplayName("Should get all requests with pagination")
        void getAllRequests_Paginated() {
            Pageable pageable = PageRequest.of(0, 20);
            Page<MaintenanceRequest> page = new PageImpl<>(List.of(testRequest), pageable, 1);
            when(repository.findAll(pageable)).thenReturn(page);

            Page<MaintenanceResponseDTO> result = maintenanceService.getAllRequests(pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should get requests by user")
        void getRequestsByUser() {
            when(repository.findByUserId(1L)).thenReturn(List.of(testRequest));

            List<MaintenanceResponseDTO> result = maintenanceService.getRequestsByUser(1L);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Update Request Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update status to COMPLETED with resolvedAt")
        void updateRequest_Complete() {
            UpdateRequestDTO updateDTO = new UpdateRequestDTO();
            updateDTO.setStatus(Status.COMPLETED);

            when(repository.findById(1L)).thenReturn(Optional.of(testRequest));
            when(repository.save(any(MaintenanceRequest.class))).thenReturn(testRequest);
            when(restTemplate.getForObject(anyString(), eq(UserResponse.class))).thenReturn(testUser);

            maintenanceService.updateRequest(1L, updateDTO);

            assertThat(testRequest.getResolvedAt()).isNotNull();
        }

        @Test
        @DisplayName("Should assign technician and change status to IN_PROGRESS")
        void updateRequest_AssignTechnician() {
            UpdateRequestDTO updateDTO = new UpdateRequestDTO();
            updateDTO.setAssignedTo(2L);

            UserResponse technician = new UserResponse();
            technician.setId(2L);
            technician.setEmail("tech@example.com");
            technician.setFullName("Tech User");

            when(repository.findById(1L)).thenReturn(Optional.of(testRequest));
            when(repository.save(any(MaintenanceRequest.class))).thenReturn(testRequest);
            when(restTemplate.getForObject(contains("/api/users/2"), eq(UserResponse.class))).thenReturn(technician);
            when(restTemplate.getForObject(contains("/api/users/1"), eq(UserResponse.class))).thenReturn(testUser);

            maintenanceService.updateRequest(1L, updateDTO);

            assertThat(testRequest.getAssignedTo()).isEqualTo(2L);
            assertThat(testRequest.getStatus()).isEqualTo(Status.IN_PROGRESS);
            verify(notificationPublisher).publishAssignment(
                    eq("tech@example.com"), anyString(), anyString(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for unknown request")
        void updateRequest_NotFound() {
            when(repository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> maintenanceService.updateRequest(99L, new UpdateRequestDTO()))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Delete Request Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete request and its image")
        void deleteRequest_WithImage() {
            testRequest.setImageUrl("https://bucket/image.jpg");
            when(repository.findById(1L)).thenReturn(Optional.of(testRequest));

            maintenanceService.deleteRequest(1L);

            verify(s3Service).deleteImage("https://bucket/image.jpg");
            verify(repository).deleteById(1L);
        }

        @Test
        @DisplayName("Should delete request without image")
        void deleteRequest_NoImage() {
            when(repository.findById(1L)).thenReturn(Optional.of(testRequest));

            maintenanceService.deleteRequest(1L);

            verify(s3Service, never()).deleteImage(anyString());
            verify(repository).deleteById(1L);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException for unknown request")
        void deleteRequest_NotFound() {
            when(repository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> maintenanceService.deleteRequest(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Statistics Tests")
    class StatisticsTests {

        @Test
        @DisplayName("Should return DB-level statistics")
        void getStatistics() {
            when(repository.count()).thenReturn(10L);
            when(repository.countByStatus(Status.PENDING)).thenReturn(3L);
            when(repository.countByStatus(Status.IN_PROGRESS)).thenReturn(4L);
            when(repository.countByStatus(Status.COMPLETED)).thenReturn(3L);
            when(repository.countByPriority(Priority.CRITICAL)).thenReturn(2L);

            Map<String, Long> stats = maintenanceService.getStatistics();

            assertThat(stats.get("total")).isEqualTo(10L);
            assertThat(stats.get("pending")).isEqualTo(3L);
            assertThat(stats.get("inProgress")).isEqualTo(4L);
            assertThat(stats.get("completed")).isEqualTo(3L);
            assertThat(stats.get("critical")).isEqualTo(2L);
        }
    }

    @Nested
    @DisplayName("User Details Tests")
    class UserDetailsTests {

        @Test
        @DisplayName("Should fetch user details from user service")
        void getUserDetails_Success() {
            when(restTemplate.getForObject(anyString(), eq(UserResponse.class))).thenReturn(testUser);

            UserResponse result = maintenanceService.getUserDetails(1L);

            assertThat(result.getEmail()).isEqualTo("user@example.com");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user not found")
        void getUserDetails_NullResponse() {
            when(restTemplate.getForObject(anyString(), eq(UserResponse.class))).thenReturn(null);

            assertThatThrownBy(() -> maintenanceService.getUserDetails(1L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should throw ServiceUnavailableException on connection failure")
        void getUserDetails_ServiceDown() {
            when(restTemplate.getForObject(anyString(), eq(UserResponse.class)))
                    .thenThrow(new RuntimeException("Connection refused"));

            assertThatThrownBy(() -> maintenanceService.getUserDetails(1L))
                    .isInstanceOf(ServiceUnavailableException.class)
                    .hasMessageContaining("User service is unavailable");
        }
    }
}
