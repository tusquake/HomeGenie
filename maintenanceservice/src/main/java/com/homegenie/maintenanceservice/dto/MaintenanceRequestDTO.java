package com.homegenie.maintenanceservice.dto;

import com.homegenie.maintenanceservice.model.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String imageBase64;
}