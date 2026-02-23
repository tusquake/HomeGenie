package com.homegenie.userservice.controller;

import com.homegenie.userservice.service.VisitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    private final VisitService visitService;

    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    @PostMapping
    public ResponseEntity<?> recordVisit(HttpServletRequest request) {
        String ip = extractClientIp(request);
        int count = visitService.recordVisit(ip);
        return ResponseEntity.ok(Map.of("uniqueVisitors", count));
    }

    @GetMapping("/unique")
    public ResponseEntity<?> getUnique() {
        return ResponseEntity.ok(Map.of("uniqueVisitors", visitService.uniqueCount()));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
