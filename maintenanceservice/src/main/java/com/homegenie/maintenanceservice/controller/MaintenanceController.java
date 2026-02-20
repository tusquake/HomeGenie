package com.homegenie.maintenanceservice.controller;

import com.homegenie.maintenanceservice.dto.*;
import com.homegenie.maintenanceservice.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceResponseDTO> createRequest(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody MaintenanceRequestDTO request) {
        return ResponseEntity.ok(maintenanceService.createRequest(userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<MaintenanceResponseDTO>> getAllRequests(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(maintenanceService.getAllRequests(pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MaintenanceResponseDTO>> getUserRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(maintenanceService.getRequestsByUser(userId));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<MaintenanceResponseDTO>> getTechnicianRequests(@PathVariable Long technicianId) {
        return ResponseEntity.ok(maintenanceService.getRequestsByTechnician(technicianId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponseDTO> getRequest(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getRequestById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceResponseDTO> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRequestDTO request) {
        return ResponseEntity.ok(maintenanceService.updateRequest(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        maintenanceService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        return ResponseEntity.ok(maintenanceService.getStatistics());
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserResponse>> getTechnicians() {
        return ResponseEntity.ok(maintenanceService.getAllTechnicians());
    }
}