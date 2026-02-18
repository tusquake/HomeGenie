#!/bin/bash

# ==============================================================================
# HomeGenie - Google Cloud Platform Deployment Script
# ==============================================================================
# 
# Usage:
#   1. Open Google Cloud Shell (https://shell.cloud.google.com)
#   2. Clone your repo or upload this folder.
#   3. Run: bash deploy_gcp.sh
# 
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Starting HomeGenie GCP Deployment Script..."

# --- Configuration ---
PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"
REPO_NAME="homegenie-repo"
DB_INSTANCE="homegenie-db"
DB_USER="homegenie_app"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: value"
    echo "   Ensure you have selected a project: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "✅ Using Project: $PROJECT_ID"
echo "✅ Region: $REGION"

# --- 1. Enable APIs ---
echo "🛠 Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com \
    servicenetworking.googleapis.com

# --- 2. Create Artifact Registry ---
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION > /dev/null 2>&1; then
    echo "📦 Creating Artifact Registry Repository: $REPO_NAME..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="HomeGenie Microservices"
else
    echo "✅ Artifact Registry '$REPO_NAME' already exists."
fi

# --- 2.5 Create Cloud Storage Bucket ---
BUCKET_NAME="homegenie-maintenance-uploads-${PROJECT_ID}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" > /dev/null 2>&1; then
    echo "🪣 Creating Cloud Storage Bucket: $BUCKET_NAME..."
    gsutil mb -l $REGION "gs://${BUCKET_NAME}"
    gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}"
else
    echo "✅ Storage Bucket '$BUCKET_NAME' already exists."
fi

# --- 3. Database Setup ---
if ! gcloud sql instances describe $DB_INSTANCE > /dev/null 2>&1; then
    echo "🗄 Creating Cloud SQL Instance: $DB_INSTANCE (this takes ~5-10 mins)..."
    read -sp "Enter Password for 'root' user: " ROOT_PASSWORD
    echo ""
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --cpu=1 --memory=4GB \
        --region=$REGION \
        --root-password=$ROOT_PASSWORD \
        --quiet
else
    echo "✅ Cloud SQL Instance '$DB_INSTANCE' already exists."
fi

echo "🗄 Creating Databases..."
gcloud sql databases create homegenie_users --instance=$DB_INSTANCE --quiet || true
gcloud sql databases create homegenie_maintenance --instance=$DB_INSTANCE --quiet || true

if ! gcloud sql users list --instance=$DB_INSTANCE | grep -q $DB_USER; then
    read -sp "Enter Password for '$DB_USER' application user: " APP_DB_PASSWORD
    echo ""
    gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password=$APP_DB_PASSWORD
else
    echo "✅ Database user '$DB_USER' already exists."
    # We still need the password for deployment env vars
    if [ -z "$APP_DB_PASSWORD" ]; then
        read -sp "Enter existing Password for '$DB_USER' to use in deployment: " APP_DB_PASSWORD
        echo ""
    fi
fi

# --- 4. Build & Deploy Function ---
deploy_service() {
    SERVICE_NAME=$1
    DIR_NAME=$2
    USE_DB=$3
    ENV_VARS=$4

    echo "🚀 Deploying $SERVICE_NAME..."
    
    IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}:latest"
    
    # Cloud Build (Remote Build)
    gcloud builds submit $DIR_NAME --tag $IMAGE_URI --quiet

    # Base Deploy Command
    CMD="gcloud run deploy $SERVICE_NAME --image=$IMAGE_URI --region=$REGION --allow-unauthenticated --quiet"
    
    # Add DB Connection if needed
    if [ "$USE_DB" = "true" ]; then
        CMD="$CMD --add-cloudsql-instances=${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
        CMD="$CMD --set-env-vars=DB_HOST=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE},DB_USERNAME=${DB_USER},DB_PASSWORD=${APP_DB_PASSWORD}"
    fi

    # Add Extra Env Vars
    if [ -n "$ENV_VARS" ]; then
        CMD="$CMD --set-env-vars=$ENV_VARS"
    fi

    # Execute Deploy
    eval $CMD
}

# --- 5. Deploy Microservices ---

# User Service
deploy_service "user-service" "userservice" "true" "SPRING_PROFILES_ACTIVE=prod,DB_URL=jdbc:postgresql:///homegenie_users?host=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

# Maintenance Service (needs rabbitmq, for now just DB)
deploy_service "maintenance-service" "maintenanceservice" "true" "SPRING_PROFILES_ACTIVE=prod,GCP_STORAGE_BUCKET=${BUCKET_NAME},DB_URL=jdbc:postgresql:///homegenie_maintenance?host=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

# Notification Service
deploy_service "notification-service" "notification-service" "false" "SPRING_PROFILES_ACTIVE=prod"

# Voice Service (needs API key)
if [ -z "$GEMINI_API_KEY" ]; then
    read -sp "Enter GEMINI_API_KEY (or press enter to skip): " GEMINI_API_KEY
    echo ""
fi
deploy_service "voice-service" "python-voice-service" "false" "GEMINI_API_KEY=${GEMINI_API_KEY}"

# --- 6. Get Service URLs ---
USER_URL=$(gcloud run services describe user-service --region $REGION --format 'value(status.url)')
MAINT_URL=$(gcloud run services describe maintenance-service --region $REGION --format 'value(status.url)')
VOICE_URL=$(gcloud run services describe voice-service --region $REGION --format 'value(status.url)')
NOTIF_URL=$(gcloud run services describe notification-service --region $REGION --format 'value(status.url)')

echo "🌐 Service URLs captured:"
echo "   User: $USER_URL"
echo "   Maintenance: $MAINT_URL"
echo "   Voice: $VOICE_URL"
echo "   Notification: $NOTIF_URL"

# --- 7. Deploy API Gateway ---
echo "🚀 Deploying API Gateway..."
GATEWAY_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/api-gateway:latest"
gcloud builds submit api-gateway --tag $GATEWAY_IMAGE --quiet

# Prompt for Frontend URL for CORS
read -p "Enter Frontend URL (e.g., https://myapp.web.app) for CORS [Default: *]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-"*"}

gcloud run deploy api-gateway \
    --image=$GATEWAY_IMAGE \
    --region=$REGION \
    --allow-unauthenticated \
    --set-env-vars="USER_SERVICE_URL=${USER_URL},MAINTENANCE_SERVICE_URL=${MAINT_URL},VOICE_SERVICE_URL=${VOICE_URL},NOTIFICATION_SERVICE_URL=${NOTIF_URL},CORS_ALLOWED_ORIGINS=${FRONTEND_URL}" \
    --quiet

# --- End ---
GATEWAY_URL=$(gcloud run services describe api-gateway --region $REGION --format 'value(status.url)')
echo "🎉 Deployment Complete!"
echo "👉 API Gateway URL: $GATEWAY_URL"
echo "👉 Use this URL in your Frontend .env file."
