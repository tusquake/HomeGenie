# HomeGenie - Smart Maintenance Management System

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)

![Java](https://img.shields.io/badge/Java-17-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-green?logo=spring)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![AWS](https://img.shields.io/badge/AWS-Free%20Tier-orange?logo=amazon-aws)

HomeGenie is an AI-powered maintenance management platform designed for residential societies. It enables residents to raise maintenance requests with photos, allows administrators to track and assign tasks, and sends automated email notifications for efficient issue resolution.

---

## Application Flow:
1.Register
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b0466935-8bcb-44ee-81af-bcafd721e142" />

2.Login
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9453e72e-e274-44c2-ad8a-977353fa3ea1" />

3. Dashboard (Resident)
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
React Frontend (Port 3000)
  - User registration and login
  - Request creation and tracking
  - Admin dashboard
  - Technician assignment

User Service (Port 8081)
  - Authentication (JWT)
  - User management
  - Role-based access control
  - Technician directory

Maintenance Service (Port 8082)
  - Request management (CRUD)
  - AI classification and priority assignment
  - Email notifications and scheduling
  - Statistics and analytics

PostgreSQL Databases
  - homegenie_users
  - homegenie_maintenance

AWS Integration
  - S3 for image storage
  - SES for email notifications
  - EC2 for deployment
```

---

## Tech Stack

**Backend**
- Spring Boot 3.2.0 (Java 17)
- Hibernate / JPA
- PostgreSQL
- JWT Authentication

**Frontend**
- React 18
- Tailwind CSS
- Lucide React for icons

**Cloud & AI**
- Hugging Face API for classification
- AWS S3 for image storage
- AWS SES for email delivery
- AWS EC2 for hosting

---

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- AWS account (Free Tier)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/homegenie.git
   cd homegenie
   ```

2. Create PostgreSQL databases:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE homegenie_users;
   CREATE DATABASE homegenie_maintenance;
   \q
   ```

3. Configure AWS S3 and SES.

4. Start backend services:
   ```bash
   # User Service
   cd user-service
   mvn spring-boot:run

   # Maintenance Service
   cd maintenance-service
   mvn spring-boot:run
   ```

5. Start frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```
