package com.homegenie.maintenanceservice.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.type", havingValue = "gcs", matchIfMissing = true)
@Primary
public class GcsStorageService implements StorageService {

    private final Storage storage;

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    @Override
    public String uploadImage(String base64Image) {
        try {
            String[] parts = base64Image.split(",");
            String imageString = parts.length > 1 ? parts[1] : parts[0];
            byte[] imageBytes = Base64.getDecoder().decode(imageString);

            String fileName = UUID.randomUUID().toString() + ".jpg";
            BlobId blobId = BlobId.of(bucketName, fileName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType("image/jpeg")
                    .build();

            storage.create(blobInfo, imageBytes);

            // Return public URL (assuming bucket is public or object is made public)
            // Or signed URL if needed, but for simplicity returning public link format
            return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);

        } catch (Exception e) {
            log.error("Failed to upload image to GCS", e);
            throw new RuntimeException("Failed to upload image to GCS: " + e.getMessage());
        }
    }

    @Override
    public void deleteImage(String imageUrl) {
        try {
            // Extract filename from URL
            // Format: https://storage.googleapis.com/BUCKET_NAME/FILE_NAME
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            BlobId blobId = BlobId.of(bucketName, fileName);
            boolean deleted = storage.delete(blobId);
            if (deleted) {
                log.info("Deleted image from GCS: {}", fileName);
            } else {
                log.warn("Image not found in GCS: {}", fileName);
            }
        } catch (Exception e) {
            log.error("Failed to delete image from GCS", e);
            // Don't throw exception on delete failure to avoid breaking flow
        }
    }
}
