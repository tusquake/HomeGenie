package com.homegenie.maintenanceservice.service;

import com.homegenie.maintenanceservice.dto.AIClassificationResponse;
import com.homegenie.maintenanceservice.model.Category;
import com.homegenie.maintenanceservice.model.Priority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AIClassificationServiceTest {

    @Mock
    private WebClient webClient;

    @InjectMocks
    private AIClassificationService aiService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiService, "apiToken", "");
    }

    @Nested
    @DisplayName("Rule-Based Classification Tests")
    class RuleBasedTests {

        @Test
        @DisplayName("Should classify plumbing issue")
        void classify_Plumbing() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Leaking Pipe", "The kitchen pipe is leaking water everywhere");

            assertThat(result.getCategory()).isEqualTo(Category.PLUMBING);
        }

        @Test
        @DisplayName("Should classify electrical issue")
        void classify_Electrical() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Power Outage", "The circuit breaker keeps tripping in the living room");

            assertThat(result.getCategory()).isEqualTo(Category.ELECTRICAL);
        }

        @Test
        @DisplayName("Should classify security issue")
        void classify_Security() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Broken Lock", "The main door lock is broken and won't close properly");

            assertThat(result.getCategory()).isEqualTo(Category.SECURITY);
        }

        @Test
        @DisplayName("Should classify cleaning issue")
        void classify_Cleaning() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Dirty Lobby", "The lobby floor is dirty and needs mopping");

            assertThat(result.getCategory()).isEqualTo(Category.CLEANING);
        }

        @Test
        @DisplayName("Should classify HVAC issue")
        void classify_HVAC() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "AC Not Working", "The air conditioning unit is not cooling");

            assertThat(result.getCategory()).isEqualTo(Category.HVAC);
        }

        @Test
        @DisplayName("Should default to OTHERS for unrecognized issue")
        void classify_Others() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "General Issue", "Something is wrong but I can't describe it");

            assertThat(result.getCategory()).isEqualTo(Category.OTHERS);
        }
    }

    @Nested
    @DisplayName("Priority Classification Tests")
    class PriorityTests {

        @Test
        @DisplayName("Should assign CRITICAL priority for urgent issues")
        void priority_Critical() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Gas Leak Emergency", "There is a gas leak in the building, very dangerous");

            assertThat(result.getPriority()).isEqualTo(Priority.CRITICAL);
        }

        @Test
        @DisplayName("Should assign HIGH priority")
        void priority_High() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Water Flooding", "Water is flooding the bathroom from broken pipe");

            assertThat(result.getPriority()).isIn(Priority.HIGH, Priority.CRITICAL);
        }

        @Test
        @DisplayName("Should assign LOW or MODERATE for non-urgent issues")
        void priority_Low() {
            AIClassificationResponse result = aiService.classifyRequest(
                    "Paint Touch Up", "Wall paint is slightly faded in the hallway");

            assertThat(result.getPriority()).isIn(Priority.LOW, Priority.MODERATE);
        }
    }

    @Test
    @DisplayName("Should never return null classification")
    void classify_NeverNull() {
        AIClassificationResponse result = aiService.classifyRequest("", "");

        assertThat(result).isNotNull();
        assertThat(result.getCategory()).isNotNull();
        assertThat(result.getPriority()).isNotNull();
    }
}
