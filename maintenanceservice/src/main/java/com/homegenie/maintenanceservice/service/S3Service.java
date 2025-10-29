package com.homegenie.maintenanceservice.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class S3Service {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.access-key}")
    private String accessKey;

    @Value("${aws.secret-key}")
    private String secretKey;

    @Value("${aws.region:us-east-1}")
    private String region;

    private AmazonS3 s3Client;

    private AmazonS3 getS3Client() {
        if (s3Client == null) {
            BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            s3Client = AmazonS3ClientBuilder
                    .standard()
                    .withCredentials(new AWSStaticCredentialsProvider(credentials))
                    .withRegion(Regions.fromName(region))
                    .build();
        }
        return s3Client;
    }

    public String uploadImage(String base64Image) {
        try {
            // Remove data:image/png;base64, prefix if present
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.split(",")[1];
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            String fileName = "maintenance/" + UUID.randomUUID().toString() + ".jpg";

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(imageBytes.length);
            metadata.setContentType("image/jpeg");

            ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);

            PutObjectRequest putRequest = new PutObjectRequest(
                    bucketName,
                    fileName,
                    inputStream,
                    metadata
            );

            getS3Client().putObject(putRequest);

            String imageUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucketName, region, fileName);

            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;

        } catch (Exception e) {
            log.error("Failed to upload image to S3", e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            getS3Client().deleteObject(bucketName, "maintenance/" + fileName);
            log.info("Image deleted successfully: {}", fileName);
        } catch (Exception e) {
            log.error("Failed to delete image from S3", e);
        }
    }
}