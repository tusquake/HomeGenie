# HomeGenie - Smart Maintenance Management System

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)

![Java](https://img.shields.io/badge/Java-17-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green?logo=spring)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![GCP](https://img.shields.io/badge/GCP-Cloud%20Run-4285F4?logo=google-cloud&logoColor=white)

HomeGenie is an AI-powered maintenance management platform designed for residential societies. It enables residents to raise maintenance requests with photos, allows administrators to track and assign tasks, and sends automated email notifications for efficient issue resolution.

---

## Application Flow:
1.Register
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b0466935-8bcb-44ee-81af-bcafd721e142" />

2.Login
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9453e72e-e274-44c2-ad8a-977353fa3ea1" />

3.Dashboard (Resident)
<img width="1898" height="1080" alt="image" src="https://github.com/user-attachments/assets/e4c3699e-0e03-42e5-b350-bd930cc3c09d" />

4.Create New Request(Resident)
<img width="1903" height="1080" alt="image" src="https://github.com/user-attachments/assets/a75ef4fd-89f7-4786-a062-c512d7fab699" />

5.Dashboard (Admin)
<img width="1891" height="1079" alt="image" src="https://github.com/user-attachments/assets/2a387206-836f-4506-981c-b6e3b5f5559b" />

6.Assign Technician
<img width="1895" height="1078" alt="image" src="https://github.com/user-attachments/assets/015232f2-a601-4032-84d9-01f0feada49f" />

7.Voice Assitant
<img width="1902" height="1079" alt="image" src="https://github.com/user-attachments/assets/4b42d4e0-a911-42fd-b512-58eb66bc1d34" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/661fddb9-25a9-4325-b647-e06dde59519e" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/be46800c-233d-49d4-933d-57a3310ac7f2" />

Email Notifications:
User-> Admin (on request creation)
<img width="1838" height="840" alt="image" src="https://github.com/user-attachments/assets/cfa1f126-2a56-47fd-bac1-7cbc3bc5d903" />

Admin-> Technician (on assigning request)
<img width="1842" height="826" alt="image" src="https://github.com/user-attachments/assets/a660efbc-69ce-4276-8517-b9328c4068a5" />

Admin-> User(on request status update)
<img width="1832" height="800" alt="image" src="https://github.com/user-attachments/assets/d46d7064-9181-4bcf-93dd-9b35be7789c8" />

Monitoring:

Grafana:

<img width="1896" height="1080" alt="image" src="https://github.com/user-attachments/assets/9842caaa-f5bd-4105-b599-3c2965ea975b" />

Prometheus:

<img width="1898" height="1077" alt="image" src="https://github.com/user-attachments/assets/871e9b6a-eee3-481c-bcc3-65e9d1035bb6" />

---


## Overview

HomeGenie centralizes the process of handling maintenance requests in residential complexes. It replaces manual communication methods such as WhatsApp or Excel sheets with a structured, automated workflow.

The platform uses AI to classify issues by category and priority and provides real-time status tracking for residents, administrators, and technicians.

### Key Problems Addressed
- Manual tracking of maintenance issues
- Lack of visibility into request status
- Missed or delayed handling of urgent problems
- No centralized reporting or accountability

### Solution Highlights
- Speech-to-Text: Converts voice commands to text using Google Speech Recognition
- Intent Recognition: Uses Google Gemini / Hugging Face AI to understand user requests
- Centralized management of all maintenance requests
- AI-driven categorization and prioritization
- Email notifications to all stakeholders
- Real-time tracking of progress and completion
- Cloud-based storage for uploaded issue photos
  
**Example Interactions:**
```
User: "My kitchen sink is leaking"
AI: "I've created your maintenance request for a plumbing issue 
     with high priority. Ticket #41 has been submitted."

User: "Emergency! Water flooding my apartment!"
AI: "I've detected an emergency. Creating critical priority ticket 
     immediately. Help is on the way!"

User: "What's the status of my AC repair?"
AI: "Your AC repair request #41 is in progress. Technician 
     will arrive tomorrow between 2-4 PM."
```

---

## Core Features

### AI-Based Classification

Example:
```
User Input: "Urgent! Water leaking from bathroom tap"
AI Output: Category = PLUMBING, Priority = CRITICAL
```

### Automated Email Notifications

Email notifications are automatically sent when:
- A resident creates a new request
- The admin assigns a technician
- A technician updates the request status
- A request is completed

### Admin Dashboard
- Displays total requests and their statuses
- Filters by category, priority, and technician
- Real-time updates and analytics

### Scheduler for Pending Requests

A background scheduler runs periodically to check for requests that have remained in a **Pending** state for more than 24 hours.  
If such requests are found, the system sends reminder emails to the admin.

**Implementation Details:**
- The scheduler runs every 2 minutes in test mode (configurable via cron expression)
- It fetches all pending maintenance requests from the database
- For each request older than 24 hours, it retrieves user details from the User Service
- Sends a reminder email to the admin with request details


---

## Architecture

```
React Frontend (Vite)
  - User registration and login
  - Request creation and tracking
  - Admin dashboard
  - Technician assignment
        │
        ▼
API Gateway (Port 8080) ─────────────────────────────────────
  │                                                          │
  ├─► User Service (Port 8081)                               │
  │     - Authentication (JWT)                               │
  │     - User management                                    │
  │     - Role-based access control                          │
  │     - Technician directory                               │
  │                                                          │
  ├─► Maintenance Service (Port 8082)                        │
  │     - Request management (CRUD)                          │
  │     - AI classification and priority assignment          │
  │     - Image upload (GCS / S3 with local fallback)        │
  │     - Statistics and analytics                           │
  │                                                          │
  ├─► Notification Service (Port 8083)                       │
  │     - Event-driven email notifications (RabbitMQ)        │
  │     - New request, assignment, and status update alerts   │
  │                                                          │
  └─► Python Voice Service (Port 5000)                       │
        - Speech-to-Text (Google Speech Recognition)         │
        - Text-to-Speech (gTTS)                              │
        - AI Intent Recognition (Gemini 2.0 Flash)           │
─────────────────────────────────────────────────────────────┘

Google Cloud Platform
  - Cloud Run (serverless container hosting)
  - Cloud SQL (managed PostgreSQL)
  - Cloud Storage (image uploads)
  - Artifact Registry (Docker images)

CI/CD
  - GitHub Actions (automated test → build → deploy pipeline)
```

---

## API Gateway

The API Gateway is implemented using **Spring Cloud Gateway** (free, open-source) and serves as a single entry point for all backend services.

### How It Works

1. **Single Entry Point**: All API requests from the frontend go to `http://localhost:8080`
2. **Route Matching**: The gateway matches incoming requests by path patterns
3. **Request Forwarding**: Requests are forwarded to the appropriate backend service
4. **Response Relay**: Service responses are relayed back to the frontend

### Route Configuration

| Route Pattern | Target Service | Port |
|---------------|----------------|------|
| `/api/auth/**` | User Service | 8081 |
| `/api/users/**` | User Service | 8081 |
| `/api/technicians/**` | User Service | 8081 |
| `/api/maintenance/**` | Maintenance Service | 8082 |
| `/api/speech-to-text` | Voice Service | 8000 |
| `/api/text-to-speech` | Voice Service | 8000 |
| `/api/recognize-intent` | Voice Service | 8000 |

### Benefits

- **Simplified Frontend**: Frontend only needs to know one URL
- **Centralized CORS**: CORS handled at gateway level
- **Easy Scaling**: Add new services without frontend changes
- **Future-Ready**: Easy to add rate limiting, authentication, logging

---

## Tech Stack

**Backend**
- Spring Boot 3.2.0 (Java 17)
- Spring Cloud Gateway (API Gateway)
- Hibernate / JPA
- PostgreSQL 15
- JWT Authentication
- RabbitMQ (event-driven notifications)
- Redis (caching)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Lucide React for icons

**Cloud & AI**
- Google Gemini 2.0 Flash (voice intent recognition)
- Hugging Face API (issue classification)
- Google Cloud Storage (image uploads)
- Google Cloud SQL (managed PostgreSQL)
- Google Cloud Run (serverless deployment)

**DevOps**
- Docker (containerized microservices)
- Docker Compose (local development)
- GitHub Actions (CI/CD pipeline)
- GCP Artifact Registry (Docker image storage)

---

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- GCP account (for cloud deployment)

### Local Development (Docker Compose)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/homegenie.git
   cd homegenie
   ```

2. Create a `.env` file (see `.env.example`) and start all services:
   ```bash
   docker-compose up --build
   ```

3. Start the frontend:
   ```bash
   cd homegenie-app
   npm install
   npm run dev
   ```

### GCP Cloud Deployment

1. Run the one-time setup script in **Google Cloud Shell**:
   ```bash
   bash setup_gcp.sh
   ```
   This creates: Artifact Registry, Cloud SQL, GCS bucket, and a service account.

2. Add the required **GitHub Secrets** (GCP_PROJECT_ID, GCP_SA_KEY, DB credentials, etc.).

3. Push to `main` — the CI/CD pipeline will automatically:
   - Run unit tests for all services
   - Build & push Docker images to Artifact Registry
   - Deploy all services to Cloud Run
   - Configure the API Gateway with service URLs

---

## CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment. On every push to `main`:

```
Test (parallel)          Build & Push           Deploy Backend         Deploy Gateway
┌──────────────────┐    ┌────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ test-user-service│    │                │    │ user-service     │    │                 │
│ test-maintenance │───►│ Docker images  │───►│ maintenance-svc  │───►│ api-gateway     │
│ test-notif-svc   │    │ → Artifact Reg │    │ notification-svc │    │ (with svc URLs) │
│ build-gateway    │    │                │    │ voice-service    │    │                 │
└──────────────────┘    └────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## Roadmap & Future Enhancements

### Smart Technician Management
- **AI-powered technician recommendation** — auto-suggest the best technician based on skill set, availability, workload, and past performance ratings
- **Dedicated Technician Dashboard** — task acceptance/rejection, real-time status updates, ETA tracking, and work log submission
- **Technician skill profiling** — maintain a skills matrix (plumbing, electrical, HVAC, etc.) for intelligent auto-assignment
- **Workload balancing** — prevent overloading a single technician by distributing tasks evenly

### Admin Approval Workflow
- **Multi-step approval process** — admin reviews and approves before a request is marked as completed
- **Completion verification** — require photo evidence and resident sign-off before closing tickets
- **Escalation rules** — auto-escalate unresolved requests based on SLA timers (e.g., 24h for HIGH, 4h for CRITICAL)
- **Bulk operations** — approve, assign, or close multiple requests in a single action

### Real-Time Location Tracking
- **Live technician tracking** — track assigned technician's location on a map during active assignments
- **Geofencing alerts** — notify residents when the technician is nearby or has arrived at the location
- **Route optimization** — suggest optimal routes for technicians with multiple assignments
- **Estimated arrival time** — dynamic ETA calculation based on real-time location data

### Advanced Analytics & Predictive Insights
- **Interactive analytics dashboard** — charts for request trends, category distribution, resolution time, and technician performance
- **Predictive maintenance** — use historical data and ML models to predict recurring issues (e.g., seasonal plumbing problems)
- **SLA compliance tracking** — monitor response and resolution times against defined SLAs
- **Cost analysis** — track maintenance costs per category, building, and time period
- **Resident satisfaction scores** — collect and analyze feedback after request completion

### Complete Audit Log System
- **Full request lifecycle audit trail** — every action (creation, assignment, status change, comment, approval) logged with timestamp, actor, and IP
- **Admin activity logs** — track all administrative actions for accountability
- **Data export** — export audit logs as CSV/PDF for compliance and reporting
- **Change history** — view complete diff history for any modified request field

### Multi-Channel Notifications
- **Push notifications** — browser and mobile push alerts for real-time updates
- **SMS alerts** — critical/emergency notifications via SMS (Twilio integration)
- **In-app notification center** — centralized notification inbox with read/unread status
- **Notification preferences** — allow users to configure channels per notification type
- **Role-based access control (RBAC) v2** — granular permissions (building manager, floor supervisor, etc.)



### Platform Enhancements
- **Multi-tenant architecture** — support multiple residential societies on a single deployment
- **Mobile app** — native Android/iOS app using React Native
- **Offline mode** — queue requests offline and sync when connectivity is restored
- **Internationalization (i18n)** — multi-language support for diverse communities
- **Custom branding** — allow each society to customize logo, colors, and email templates
