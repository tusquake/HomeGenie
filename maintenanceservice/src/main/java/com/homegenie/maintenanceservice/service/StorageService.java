package com.homegenie.maintenanceservice.service;

public interface StorageService {
    String uploadImage(String base64Image);

    void deleteImage(String imageUrl);
}
