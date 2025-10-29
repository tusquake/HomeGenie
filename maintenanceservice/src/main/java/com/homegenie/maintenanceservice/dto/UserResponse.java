package com.homegenie.maintenanceservice.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String flatNumber;
    private String role;
    private boolean active;
}
