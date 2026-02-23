package com.homegenie.userservice.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VisitService {

    // store IP => lastSeenEpochMillis
    private final Map<String, Long> ipMap = new ConcurrentHashMap<>();

    // record a visit; returns current unique count
    public int recordVisit(String ip) {
        long now = Instant.now().toEpochMilli();
        ipMap.put(ip, now);
        // prune entries older than 30 days to keep memory bounded
        long threshold = now - 30L * 24 * 60 * 60 * 1000;
        ipMap.entrySet().removeIf(e -> e.getValue() < threshold);
        return ipMap.size();
    }

    public int uniqueCount() {
        return ipMap.size();
    }
}
