package com.homegenie.maintenanceservice.service;

import com.homegenie.maintenanceservice.dto.AIClassificationResponse;
import com.homegenie.maintenanceservice.model.Category;
import com.homegenie.maintenanceservice.model.Priority;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@Slf4j
public class AIClassificationService {

    @Value("${huggingface.api.token:}")
    private String apiToken;

    private final RestTemplate restTemplate;

    // Keywords for rule-based classification
    private static final Map<Category, List<String>> CATEGORY_KEYWORDS = Map.of(
            Category.PLUMBING, Arrays.asList("water", "leak", "pipe", "tap", "drain", "toilet", "sink", "bathroom", "kitchen"),
            Category.ELECTRICAL, Arrays.asList("light", "electricity", "power", "socket", "wiring", "switch", "fan", "bulb", "fuse"),
            Category.CLEANING, Arrays.asList("garbage", "trash", "dirty", "clean", "sweeping", "waste", "dustbin"),
            Category.SECURITY, Arrays.asList("gate", "lock", "security", "cctv", "camera", "guard", "entry", "access"),
            Category.CARPENTRY, Arrays.asList("door", "window", "furniture", "wood", "cabinet", "shelf", "wardrobe"),
            Category.PAINTING, Arrays.asList("paint", "wall", "ceiling", "color", "whitewash"),
            Category.HVAC, Arrays.asList("ac", "air conditioning", "heating", "ventilation", "temperature")
    );

    private static final List<String> CRITICAL_KEYWORDS = Arrays.asList(
            "urgent", "emergency", "immediately", "critical", "dangerous", "leak", "fire", "electrical", "gas", "no water", "no power"
    );

    public AIClassificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public AIClassificationResponse classifyRequest(String title, String description) {
        String combinedText = (title + " " + description).toLowerCase();

        // Try AI classification first (if API token is available)
        if (apiToken != null && !apiToken.isEmpty()) {
            try {
                return classifyWithHuggingFace(combinedText);
            } catch (Exception e) {
                log.warn("AI classification failed, falling back to rule-based: {}", e.getMessage());
            }
        }

        // Fallback to rule-based classification
        return classifyWithRules(combinedText);
    }

    private AIClassificationResponse classifyWithHuggingFace(String text) {
        // Using Hugging Face's zero-shot classification API (free)
        String url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        List<String> candidateLabels = Arrays.asList(
                "plumbing issue", "electrical problem", "cleaning request",
                "security concern", "carpentry work", "painting job", "hvac issue"
        );

        Map<String, Object> requestBody = Map.of(
                "inputs", text,
                "parameters", Map.of("candidate_labels", candidateLabels)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> result = response.getBody();
            List<String> labels = (List<String>) result.get("labels");
            List<Double> scores = (List<Double>) result.get("scores");

            String topLabel = labels.get(0);
            Category category = mapLabelToCategory(topLabel);
            Priority priority = determinePriority(text);

            AIClassificationResponse aiResponse = new AIClassificationResponse();
            aiResponse.setCategory(category);
            aiResponse.setPriority(priority);
            aiResponse.setReasoning("AI detected: " + topLabel + " (confidence: " +
                    String.format("%.2f", scores.get(0) * 100) + "%)");

            return aiResponse;
        }

        throw new RuntimeException("AI classification failed");
    }

    private AIClassificationResponse classifyWithRules(String text) {
        Category category = determineCategory(text);
        Priority priority = determinePriority(text);

        AIClassificationResponse response = new AIClassificationResponse();
        response.setCategory(category);
        response.setPriority(priority);
        response.setReasoning("Rule-based classification");

        return response;
    }

    private Category determineCategory(String text) {
        Map<Category, Integer> scores = new HashMap<>();

        for (Map.Entry<Category, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = 0;
            for (String keyword : entry.getValue()) {
                if (text.contains(keyword)) {
                    score++;
                }
            }
            scores.put(entry.getKey(), score);
        }

        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(Category.OTHERS);
    }

    private Priority determinePriority(String text) {
        long criticalCount = CRITICAL_KEYWORDS.stream()
                .filter(text::contains)
                .count();

        if (criticalCount >= 2) return Priority.CRITICAL;
        if (criticalCount == 1) return Priority.HIGH;
        if (text.contains("soon") || text.contains("asap")) return Priority.HIGH;
        if (text.length() > 200) return Priority.MODERATE;

        return Priority.LOW;
    }

    private Category mapLabelToCategory(String label) {
        if (label.contains("plumbing")) return Category.PLUMBING;
        if (label.contains("electrical")) return Category.ELECTRICAL;
        if (label.contains("cleaning")) return Category.CLEANING;
        if (label.contains("security")) return Category.SECURITY;
        if (label.contains("carpentry")) return Category.CARPENTRY;
        if (label.contains("painting")) return Category.PAINTING;
        if (label.contains("hvac")) return Category.HVAC;
        return Category.OTHERS;
    }
}
