# HomeGenie Backend Updates

This document summarizes the major architectural and functional changes implemented across the HomeGenie backend microservices.

## 🚀 1. GCP Pub/Sub Migration (Production)
We have transitioned the production messaging infrastructure from RabbitMQ to **Google Cloud Pub/Sub** for improved managed reliability and scalability.

- **Dual-Provider Core**: The `maintenance-service` now dynamically chooses between RabbitMQ (Development) and GCP Pub/Sub (Production) based on the active Spring profile.
- **Improved Serialization**: Resolved cross-service serialization issues by configuring `Jackson2JsonMessageConverter` with `TypePrecedence.INFERRED`, allowing seamless communication between services with different package structures.
- **Pub/Sub Infrastructure**:
  - **Topic**: `notification-topic` (Published by Maintenance Service)
  - **Subscription**: `notification-sub` (Consumed by Notification Service)

## 📊 2. Database-Backed Visit Tracking
The site visit tracking in `userservice` has been migrated from volatile in-memory storage to a persistent database.

- **Persistence Layer**: Implemented a JPA-managed `Visit` entity and repository.
- **Reliability**: Visit counts now persist across server restarts and deployments.
- **Data Points**: Tracks unique IP addresses and cumulative hit counts.

## 🛡️ 3. Reliability & Error Handling
Several improvements were made to ensure the system is "fail-visible" and robust.

- **Explicit Email Failures**: Refactored `EmailService` to propagate SMTP errors. If the notification service fails to send an email, it now correctly returns a failure response instead of a silent `200 OK`.
- **Classification Tie-Breaking**: Enhanced the `AIClassificationService` rule-based engine to use occurrence-based scoring. This ensures more accurate categorization for descriptions that contain multiple related keywords (e.g., "Broken Lock on the Door" now correctly maps to `SECURITY` instead of `CARPENTRY`).

## 🧪 4. Testing & CI/CD
The test suites were updated to ensure local development and CI/CD pipelines remain green.

- **Test Profiles**: Introduced an `application-test.yml` in the notification service to mock GCP properties, allowing `SpringBootTest` contexts to load without requiring active GCP credentials.
- **Occurrence-Based Assertions**: Updated classification tests to verify the refined rule-based scoring logic.

## 🛠️ Deployment Configuration
The `application-prod.yml` files for the maintenance and notification services now require:
- `GCP_PROJECT_ID`: The ID of your Google Cloud project.
## 🛰️ 5. Distributed Tracing
End-to-end request tracking is now enabled across all microservices using **Micrometer Tracing**, **OpenTelemetry**, and **Google Cloud Trace**.

- **Visibility**: Every request is assigned a `traceId`. You can follow a request from the `api-gateway` → `maintenanceservice` → `Pub/Sub` → `notification-service`.
- **Log Correlation**: Application logs now include tracing context: `[service-name, traceId, spanId]`.
- **GCP Console**: View the waterfall charts in the [Trace List Console](https://console.cloud.google.com/tracing/trace).

### How to use:
1. Search for a `traceId` from any log entry in **Cloud Logging**.
2. Click "View trace details" to see the full latency breakdown and cross-service hops.
