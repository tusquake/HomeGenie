package com.homegenie.maintenanceservice.repository;

import com.homegenie.maintenanceservice.model.MaintenanceRequest;
import com.homegenie.maintenanceservice.model.Priority;
import com.homegenie.maintenanceservice.model.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByUserId(Long userId);

    Page<MaintenanceRequest> findByUserId(Long userId, Pageable pageable);

    List<MaintenanceRequest> findByStatus(Status status);

    List<MaintenanceRequest> findByAssignedTo(Long assignedTo);

    long countByStatus(Status status);

    long countByPriority(Priority priority);

    List<MaintenanceRequest> findByStatusAndCreatedAtBefore(Status status, LocalDateTime cutoff);
}