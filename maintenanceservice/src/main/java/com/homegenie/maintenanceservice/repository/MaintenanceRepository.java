package com.homegenie.maintenanceservice.repository;

import com.homegenie.maintenanceservice.model.MaintenanceRequest;
import com.homegenie.maintenanceservice.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByUserId(Long userId);
    List<MaintenanceRequest> findByStatus(Status status);
    List<MaintenanceRequest> findByAssignedTo(Long assignedTo);
}