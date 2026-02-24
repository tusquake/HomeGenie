package com.homegenie.maintenanceservice.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class UserResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String flatNumber;
    private String role;
    private String specialty;
    private boolean active;
    private boolean emailNotificationsEnabled;
}
