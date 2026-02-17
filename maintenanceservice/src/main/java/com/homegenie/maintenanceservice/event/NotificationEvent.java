package com.homegenie.maintenanceservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent implements Serializable {

    private String type;
    private String recipientEmail;
    private String recipientName;
    private String subject;
    private Map<String, String> data;
}
