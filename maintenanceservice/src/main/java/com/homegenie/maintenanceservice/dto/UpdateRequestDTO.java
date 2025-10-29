package com.homegenie.maintenanceservice.dto;

import com.homegenie.maintenanceservice.model.Status;
import lombok.Data;

@Data
public class UpdateRequestDTO {
    private Status status;
    private Long assignedTo;
    private String adminNotes;
}
