package com.homegenie.maintenanceservice.dto;

import com.homegenie.maintenanceservice.model.Category;
import com.homegenie.maintenanceservice.model.Priority;
import com.homegenie.maintenanceservice.model.Status;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MaintenanceResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private Status status;
    private String imageUrl;
    private Long assignedTo;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private String adminNotes;
}
