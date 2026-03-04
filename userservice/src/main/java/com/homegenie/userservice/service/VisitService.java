package com.homegenie.userservice.service;

import com.homegenie.userservice.model.Visit;
import com.homegenie.userservice.repository.VisitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class VisitService {

    private final VisitRepository visitRepository;

    public VisitService(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }

    @Transactional
    public int recordVisit(String ip) {
        Visit visit = visitRepository.findByIp(ip)
                .map(v -> {
                    v.setLastSeen(LocalDateTime.now());
                    v.setHitCount(v.getHitCount() + 1);
                    return v;
                })
                .orElse(new Visit(ip));

        visitRepository.save(visit);
        return (int) visitRepository.count();
    }

    public int uniqueCount() {
        return (int) visitRepository.count();
    }
}
