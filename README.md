# EduHelp — Offline-First Learning Assistant

> **Progressive Web Application (PWA) designed to assist learning with or without an active internet connection.**

---

## 📖 About EduHelp

**EduHelp** is an offline-first learning platform built for students and educators. It allows users to browse course materials, read lessons, and attempt quizzes seamlessly—even when completely disconnected from the internet.

When an internet connection is available, the application automatically synchronizes quiz attempts, course progress, and new educational content with the cloud backend server.

---

## ⚙️ How It Works

EduHelp uses modern Progressive Web App (PWA) capabilities and a multi-tier caching architecture:

1. **Service Worker Cache:** Stores static assets (HTML, CSS, JavaScript, icons, and UI components) directly in the browser for instant offline loading.
2. **Local Data Persistence:** Saves course content, offline quiz submissions, and user state locally using browser storage APIs.
3. **Background Synchronization:** Detects when network connectivity returns and silently transmits cached quiz results and student progress logs to the FastAPI server.
4. **REST API Communication:** Connects to a FastAPI backend powered by an object-relational database (SQLite locally, PostgreSQL in production).

---

## System Roles & Capabilities

| Role        | Capabilities & Actions                                                                                             |
| :---------- | :----------------------------------------------------------------------------------------------------------------- |
| **Admin**   | Manages pre-authorized email directories, registers user accounts, and monitors platform activity and SMS budgets. |
| **Teacher** | Creates course modules, uploads educational content, publishes quizzes, and tracks student performance analytics.  |
| **Student** | Accesses enrolled courses, reads lesson notes offline, completes quizzes, and views progress scores.               |

---

## Pre-Authorized Demo Credentials Are Provided in CANVAS COMMENT SECTION

For testing and evaluation convenience, the system automatically seeds the following pre-authorized test email addresses on initial boot:  
The credentials for already created accounts for easy testing is provided in COMMENT SECTION on CANVAS.

---

## How to Access the Application

### 🔗 Live Production Deployment

- **Web Application URL:** [https://offline-first-learning-assistant.vercel.app/](https://offline-first-learning-assistant.vercel.app/)
- **Interactive API Documentation (Swagger):** [https://offline-first-learning-assistant.onrender.com/docs](https://offline-first-learning-assistant.onrender.com/docs)

---

## Local Setup & Execution Guide

Follow these step-by-step instructions to run EduHelp locally on your machine:

### Prerequisites

Ensure you have installed:

- **Node.js** (v18.0 or higher) & `npm`
- **Python** (v3.10 or higher)
- **Git**

---

### 1️⃣ Clone the Repository

```bash
git clone Repo
cd root-folder
```
