package com.homegenie.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ip;

    private LocalDateTime lastSeen = LocalDateTime.now();

    // Optional: track total hits per IP if desired, but request was to track total
    // visits
    private Long hitCount = 1L;

    public Visit(String ip) {
        this.ip = ip;
        this.lastSeen = LocalDateTime.now();
        this.hitCount = 1L;
    }
}
