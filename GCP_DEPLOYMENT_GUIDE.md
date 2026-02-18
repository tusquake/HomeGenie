# HomeGenie — Google Cloud Platform (GCP) Deployment Guide

This comprehensive guide details the process of deploying the HomeGenie microservices architecture to Google Cloud Platform using **Cloud Run** (for serverless containers) and **Cloud SQL** (for managed PostgreSQL).

---

## 1. Prerequisites & Setup

### A. Create GCP Project
1.  Go to the [GCP Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., `homegenie-prod`).
3.  Ensure billing is enabled.

### B. Install & Configure CLI
1.  Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2.  Initialize and authenticate:
    ```bash
    gcloud init
    gcloud auth login
    gcloud config set project homegenie-prod
    ```

### C. Enable Required APIs
Enable the necessary services for your project:
```bash
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com \
    servicenetworking.googleapis.com \
    compute.googleapis.com
```

---

## 2. Infrastructure Setup

### A. Artifact Registry (Docker Image Storage)
Create a repository to store your Docker images:
```bash
gcloud artifacts repositories create homegenie-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="HomeGenie Microservices"
```
*Configure Docker to authenticate with this repo:*
```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### B. Cloud SQL (Managed PostgreSQL)
1.  **Create Instance**:
    ```bash
    gcloud sql instances create homegenie-db \
        --database-version=POSTGRES_15 \
        --cpu=1 --memory=4GB \
        --region=us-central1 \
        --root-password=YOUR_SECURE_ROOT_PASSWORD
    ```
2.  **Create Databases**:
    ```bash
    gcloud sql databases create homegenie_users --instance=homegenie-db
    gcloud sql databases create homegenie_maintenance --instance=homegenie-db
    ```
3.  **Create Application User**:
    ```bash
    gcloud sql users create homegenie_app --instance=homegenie-db --password=DB_PASSWORD_HERE
    ```

### C. RabbitMQ & Redis (Option: VM)
For cost-efficiency, we can deploy RabbitMQ and Redis on a single small Compute Engine VM using Docker Compose.

1.  **Create VM**:
    ```bash
    gcloud compute instances create homegenie-infra \
        --zone=us-central1-a \
        --machine-type=e2-micro \
        --image-project=cos-cloud \
        --image-family=cos-stable
    ```
2.  **Deploy Containers**:
    SSH into the VM and run `docker run` commands or use `docker-compose`.
    *Note: Ensure the VM's internal IP is accessible or set up a VPC connector for Cloud Run.*

---

## 3. Build & Push Microservices

Navigate to each service directory and build/push the image.

**Common Variables:**
```bash
export PROJECT_ID=homegenie-prod
export REGION=us-central1
export REPO=homegenie-repo
export IMAGE_BASE=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}
```

### 1. User Service
```bash
cd userservice
docker build -t ${IMAGE_BASE}/user-service:v1 .
docker push ${IMAGE_BASE}/user-service:v1
```

### 2. Maintenance Service
```bash
cd ../maintenanceservice
docker build -t ${IMAGE_BASE}/maintenance-service:v1 .
docker push ${IMAGE_BASE}/maintenance-service:v1
```

### 3. Notification Service
```bash
cd ../notification-service
docker build -t ${IMAGE_BASE}/notification-service:v1 .
docker push ${IMAGE_BASE}/notification-service:v1
```

### 4. Voice Service
```bash
cd ../python-voice-service
docker build -t ${IMAGE_BASE}/voice-service:v1 .
docker push ${IMAGE_BASE}/voice-service:v1
```

### 5. API Gateway
```bash
cd ../api-gateway
docker build -t ${IMAGE_BASE}/api-gateway:v1 .
docker push ${IMAGE_BASE}/api-gateway:v1
```

---

## 4. Deploy to Cloud Run

Deploy services in order, as downstream services rely on upstream URLs.

### A. Deploy Core Services

**User Service:**
```bash
gcloud run deploy user-service \
    --image=${IMAGE_BASE}/user-service:v1 \
    --region=${REGION} \
    --allow-unauthenticated \
    --add-cloudsql-instances=${PROJECT_ID}:${REGION}:homegenie-db \
    --set-env-vars="SPRING_PROFILES_ACTIVE=prod" \
    --set-env-vars="DB_HOST=/cloudsql/${PROJECT_ID}:${REGION}:homegenie-db" \
    --set-env-vars="DB_USERNAME=homegenie_app" \
    --set-env-vars="DB_PASSWORD=DB_PASSWORD_HERE"
```

**Maintenance Service:**
*(Requires RabbitMQ connection details in env vars)*
```bash
gcloud run deploy maintenance-service \
    --image=${IMAGE_BASE}/maintenance-service:v1 \
    --region=${REGION} \
    --allow-unauthenticated \
    --add-cloudsql-instances=${PROJECT_ID}:${REGION}:homegenie-db \
    --set-env-vars="SPRING_PROFILES_ACTIVE=prod" \
    --set-env-vars="DB_HOST=/cloudsql/${PROJECT_ID}:${REGION}:homegenie-db" \
    --set-env-vars="DB_USERNAME=homegenie_app" \
    --set-env-vars="DB_PASSWORD=DB_PASSWORD_HERE"
```

**Voice Service:**
```bash
gcloud run deploy voice-service \
    --image=${IMAGE_BASE}/voice-service:v1 \
    --region=${REGION} \
    --allow-unauthenticated \
    --set-env-vars="GEMINI_API_KEY=your_key"
```

### B. Deploy API Gateway

The Gateway needs to know the URLs of the deployed services.
1.  **Get URLs**:
    ```bash
    export USER_URL=$(gcloud run services describe user-service --region ${REGION} --format 'value(status.url)')
    export MAINT_URL=$(gcloud run services describe maintenance-service --region ${REGION} --format 'value(status.url)')
    export VOICE_URL=$(gcloud run services describe voice-service --region ${REGION} --format 'value(status.url)')
    export NOTIF_URL=$(gcloud run services describe notification-service --region ${REGION} --format 'value(status.url)')
    ```

2.  **Deploy Gateway**:
    ```bash
    gcloud run deploy api-gateway \
        --image=${IMAGE_BASE}/api-gateway:v1 \
        --region=${REGION} \
        --allow-unauthenticated \
        --set-env-vars="USER_SERVICE_URL=${USER_URL}" \
        --set-env-vars="MAINTENANCE_SERVICE_URL=${MAINT_URL}" \
        --set-env-vars="VOICE_SERVICE_URL=${VOICE_URL}" \
        --set-env-vars="NOTIFICATION_SERVICE_URL=${NOTIF_URL}" \
        --set-env-vars="CORS_ALLOWED_ORIGINS=https://your-frontend-domain.web.app"
    ```

---

## 5. Frontend Deployment (Firebase)

1.  **Build React App**:
    Ensure `.env` points to the deployed API Gateway URL.
    ```bash
    cd homegenie-app
    # Update .env.production with:
    # VITE_API_BASE_URL=https://api-gateway-xyz-uc.a.run.app
    npm run build
    ```

2.  **Deploy to Firebase**:
    ```bash
    npm install -g firebase-tools
    firebase login
    firebase init hosting
    # Select 'dist' as build folder
    # Configure as single-page app (Yes)
    firebase deploy
    ```

---

## 6. Verification

- Visit the Firebase URL to load the frontend.
- Attempt to Login/Register.
- Check Cloud Run logs for any errors:
  ```bash
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=api-gateway" --limit 20
  ```
