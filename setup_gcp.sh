#!/bin/bash
set -e

echo "============================================"
echo "🚀 HomeGenie — GCP One-Time Setup Script"
echo "============================================"
echo ""

# --- Get Project ID ---
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    echo "Available projects:"
    gcloud projects list
    echo ""
    read -p "Enter your GCP Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
fi
echo "✅ Using Project: $PROJECT_ID"

# --- Configuration ---
REGION="asia-south1"
REPO_NAME="homegenie-repo"
DB_INSTANCE="homegenie-db"
DB_USER="homegenie_app"
SA_NAME="github-actions-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
BUCKET_NAME="homegenie-maintenance-uploads-${PROJECT_ID}"

echo "✅ Region: $REGION"
echo ""

# --- Step 1: Enable APIs ---
echo "🛠 [1/7] Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com \
    cloudbuild.googleapis.com \
    iam.googleapis.com
echo "✅ APIs enabled."
echo ""

# --- Step 2: Create Artifact Registry ---
echo "📦 [2/7] Setting up Artifact Registry..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION > /dev/null 2>&1; then
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="HomeGenie Microservices"
    echo "✅ Artifact Registry '$REPO_NAME' created."
else
    echo "✅ Artifact Registry '$REPO_NAME' already exists."
fi
echo ""

# --- Step 3: Create Cloud SQL ---
echo "🗄 [3/7] Setting up Cloud SQL..."
if ! gcloud sql instances describe $DB_INSTANCE > /dev/null 2>&1; then
    read -sp "Enter password for database: " DB_PASSWORD
    echo ""
    echo "   Creating Cloud SQL instance (this takes ~5-10 minutes)..."
    gcloud sql instances create $DB_INSTANCE \
        --database-version=POSTGRES_15 \
        --cpu=1 --memory=4GB \
        --region=$REGION \
        --root-password=$DB_PASSWORD \
        --quiet
    echo "✅ Cloud SQL instance created."
else
    echo "✅ Cloud SQL instance '$DB_INSTANCE' already exists."
    read -sp "Enter existing database password: " DB_PASSWORD
    echo ""
fi

echo "   Creating databases..."
gcloud sql databases create homegenie_users --instance=$DB_INSTANCE --quiet 2>/dev/null || echo "   Database 'homegenie_users' already exists."
gcloud sql databases create homegenie_maintenance --instance=$DB_INSTANCE --quiet 2>/dev/null || echo "   Database 'homegenie_maintenance' already exists."

if ! gcloud sql users list --instance=$DB_INSTANCE 2>/dev/null | grep -q $DB_USER; then
    gcloud sql users create $DB_USER --instance=$DB_INSTANCE --password=$DB_PASSWORD
    echo "✅ Database user '$DB_USER' created."
else
    echo "✅ Database user '$DB_USER' already exists."
fi
echo ""

# --- Step 4: Create GCS Bucket ---
echo "🪣 [4/7] Setting up Cloud Storage Bucket..."
if ! gsutil ls -b "gs://${BUCKET_NAME}" > /dev/null 2>&1; then
    gsutil mb -l $REGION "gs://${BUCKET_NAME}"
    gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}"
    echo "✅ Bucket '$BUCKET_NAME' created."
else
    echo "✅ Bucket '$BUCKET_NAME' already exists."
fi
echo ""

# --- Step 5: Create Service Account ---
echo "🔑 [5/7] Setting up Service Account..."
if ! gcloud iam service-accounts describe $SA_EMAIL > /dev/null 2>&1; then
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions Deployer"
    echo "✅ Service account created."
else
    echo "✅ Service account already exists."
fi
echo ""

# --- Step 6: Grant IAM Roles ---
echo "🔐 [6/7] Granting IAM roles..."
ROLES=(
    "roles/run.admin"
    "roles/artifactregistry.writer"
    "roles/iam.serviceAccountUser"
    "roles/cloudsql.client"
    "roles/storage.admin"
)
for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --quiet > /dev/null 2>&1
    echo "   ✅ Granted $ROLE"
done
echo ""

# --- Step 7: Generate JSON Key ---
echo "🔑 [7/7] Generating service account key..."
KEY_FILE="gcp-key.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL
echo "✅ Key saved to $KEY_FILE"
echo ""

# --- Summary ---
echo "============================================"
echo "🎉 GCP SETUP COMPLETE!"
echo "============================================"
echo ""
echo "Now add these secrets in GitHub → Repo → Settings → Secrets → Actions:"
echo ""
echo "┌─────────────────────────┬──────────────────────────────────────────┐"
echo "│ Secret Name             │ Value                                    │"
echo "├─────────────────────────┼──────────────────────────────────────────┤"
echo "│ GCP_PROJECT_ID          │ $PROJECT_ID                              │"
echo "│ GCP_SA_KEY              │ (paste contents of $KEY_FILE)            │"
echo "│ GCP_REGION              │ $REGION                                  │"
echo "│ DB_USERNAME             │ $DB_USER                                 │"
echo "│ DB_PASSWORD             │ (the password you entered above)         │"
echo "│ CLOUD_SQL_INSTANCE      │ $PROJECT_ID:$REGION:$DB_INSTANCE         │"
echo "│ GCP_STORAGE_BUCKET      │ $BUCKET_NAME                             │"
echo "│ GEMINI_API_KEY          │ (your Gemini API key)                    │"
echo "│ CORS_ALLOWED_ORIGINS    │ (your frontend URL)                      │"
echo "│ JWT_SECRET              │ (your JWT secret key)                    │"
echo "└─────────────────────────┴──────────────────────────────────────────┘"
echo ""
echo "To view the key contents, run:"
echo "  cat $KEY_FILE"
echo ""
echo "⚠️  After copying the key to GitHub, DELETE it:"
echo "  rm $KEY_FILE"
echo ""
