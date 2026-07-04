# BAMIKA – Learning Management System (LMS)

> A modern, full-stack Learning Management System (LMS) developed as my Computer Engineering graduation project using the PERN stack (PostgreSQL, Express.js, React, Node.js).

BAMIKA is designed to provide a complete online learning platform where administrators, instructors, and students can efficiently manage courses, learning materials, enrollments, and learning progress through a secure and responsive web application.

---

# Project Overview

BAMIKA was developed to address the need for a centralized, user-friendly, and scalable e-learning platform. The system streamlines course management, student enrollment, content delivery, and progress tracking while implementing secure authentication and role-based authorization.

The application follows modern software engineering principles, including layered architecture, RESTful API design, reusable frontend components, and clean code practices.

---

# Key Features

## Authentication & Authorization

- Secure user registration and login
- JWT Authentication
- Password hashing
- Protected API routes
- Role-Based Access Control (RBAC)

---

## User Roles

The system supports multiple user roles with different permissions.

- Super Admin
- Admin
- Teacher
- Student

---

## Course Management

Teachers and administrators can:

- Create courses
- Update course information
- Delete courses
- Publish learning content
- Organize course materials

Students can:

- Browse available courses
- View course details
- Enroll in courses

---

## Course Sections

- Create multiple sections per course
- Organize learning content
- Structured course navigation

---

## Video Management

- Upload course videos
- Manage educational content
- Watch tracking
- Video progress recording

---

## Enrollment System

Students can:

- Enroll in available courses
- View enrolled courses
- Continue learning
- Track completed courses

---

## Learning Progress Tracking

The system records student learning progress, allowing users to continue where they previously stopped.

Features include:

- Progress percentage
- Course completion tracking
- Learning history
- Video watch tracking

---

## Comment System

Students can:

- Comment on courses
- Participate in discussions
- Interact with instructors

---

## Course Like System

Students can:

- Like courses
- Save preferred learning content

---

## File Management

Teachers can upload learning resources such as:

- PDF documents
- Assignments
- Additional course materials

---

## Certificate Management

The system supports course completion certificates for students who successfully finish their courses.

---

## Intelligent Recommendation System

One of the main features of BAMIKA is its **Rule-Based Recommendation System**.

The recommendation engine suggests relevant courses based on predefined rules and user interactions, helping students discover suitable learning materials more efficiently.

---

# Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios

---

## Backend

- Node.js
- Express.js
- RESTful API
- JWT Authentication

---

## Database

- PostgreSQL

---

## Development Tools

- Git
- GitHub
- npm

---

# Project Architecture

```
React + Vite + TypeScript
            │
         Axios
            │
      RESTful API
            │
        Express.js
            │
 Route → Controller → Service
            │
       PostgreSQL
```

---

# Main Modules

- Authentication Module
- User Management
- Role Management
- Course Management
- Course Sections
- Video Module
- Enrollment Module
- Progress Tracking
- Comment Module
- Course Like Module
- File Upload Module
- Certificate Module
- Rule-Based Recommendation Engine
- Admin Dashboard
- Teacher Dashboard
- Student Dashboard

---

# Database

The application uses **PostgreSQL** as its relational database.

The database is designed using normalized relationships to ensure data consistency and maintainability.

Main entities include:

- Users
- Roles
- Courses
- Course Sections
- Videos
- Video Watches
- Enrollments
- Progress
- Comments
- Likes
- Course Files
- Certificates
- Recommendation Rules

---

# Folder Structure

```
bamika/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── screenshots/
│
├── README.md
│
└── package.json
```

---

# API Design

The backend follows RESTful API principles.

Example endpoints:

```
POST   /api/auth/login
POST   /api/auth/register

GET    /api/courses
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id

POST   /api/enrollments

GET    /api/progress

POST   /api/comments

POST   /api/likes

GET    /api/recommendations
```

---

# Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Role-Based Authorization
- Request Validation
- Error Handling
- Secure REST API Design

---

# Installation

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/bamika.git
```

---

## Navigate to the project

```bash
cd bamika
```

---

## Install dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd ../client
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the **server** directory.

Example:

```env
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_secret_key
```

---

## Run Backend

```bash
cd server
npm run dev
```

---

## Run Frontend

```bash
cd client
npm run dev
```

---

# Screenshots

Create a folder named **screenshots** inside the project root and add images like these:

```
screenshots/
│
├── home-page.png
├── login-page.png
├── register-page.png
├── student-dashboard.png
├── teacher-dashboard.png
├── admin-dashboard.png
├── course-details.png
├── video-player.png
├── progress-page.png
├── recommendation-page.png
└── certificate.png
```

Then display them in the README:

```markdown
## Home Page

![Home](screenshots/home-page.png)

## Student Dashboard

![Dashboard](screenshots/student-dashboard.png)

## Recommendation System

![Recommendation](screenshots/recommendation-page.png)
```

---

# Future Improvements

Potential future enhancements include:

- Live classes
- Online quizzes
- Assignment submission
- Notifications
- Search and filtering
- Course ratings
- Email verification
- Password recovery
- AI-powered recommendations
- Docker deployment
- CI/CD pipeline

---

# Skills Demonstrated

This project demonstrates practical experience in:

- Full-Stack Web Development
- PERN Stack Development
- PostgreSQL Database Design
- RESTful API Development
- Authentication & Authorization
- Role-Based Access Control
- Backend Architecture
- Frontend Development with React
- TypeScript Development
- Responsive UI Design
- Git Version Control
- Software Engineering Principles
- Debugging & Problem Solving

---

# Author

**Jawad**

Computer Engineering Graduate

GitHub:

https://github.com/jawad-amiri

---

# License

This project was developed as a Computer Engineering graduation project for educational purposes.
