package com.homegenie.userservice.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private Long userId;
    private String specialty;
}
