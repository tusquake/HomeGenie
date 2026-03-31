package com.homegenie.userservice.controller;

import com.homegenie.userservice.dto.UserResponse;
import com.homegenie.userservice.security.JwtUtil;
import com.homegenie.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @org.springframework.beans.factory.annotation.Value("${GOOGLE_CLIENT_ID:NOT_SET}")
    private String googleClientId;

    @GetMapping("/debug/oauth")
    public ResponseEntity<String> debugOAuth() {
        return ResponseEntity.ok("Google Client ID is: " + 
            (googleClientId.equals("NOT_SET") ? "MISSING" : "CONFIGURED (Starts with: " + googleClientId.substring(0, 4) + ")"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String email = userEmail;

        // If Gateway didn't set X-User-Email, extract from JWT directly
        if (email == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtUtil.validateToken(token)) {
                    email = jwtUtil.getEmailFromToken(token);
                }
            } catch (Exception e) {
                return ResponseEntity.status(401).build();
            }
        }

        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserResponse>> getAllTechnicians() {
        return ResponseEntity.ok(userService.getAllTechnicians());
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
