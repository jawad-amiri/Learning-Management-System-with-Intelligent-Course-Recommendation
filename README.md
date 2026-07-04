# Learning-Management-System-with-Intelligent-Course-Recommendation

A full-stack Learning Management System (LMS) developed as my Computer Engineering graduation project. This application provides a modern platform for managing online courses, student enrollments, learning progress, and instructor interactions through a secure role-based system.

The project demonstrates practical knowledge of full-stack web development, RESTful application architecture, authentication, database design, and responsive user interface development.

---

## Project Overview

This LMS is designed to simplify the management of online learning by providing separate dashboards and functionalities for administrators, teachers, and students.

The system allows instructors to publish and manage courses while enabling students to enroll, track their learning progress, and interact through comments.

---

## Key Features

### User Authentication

- Secure user registration and login
- JWT-based authentication
- Password hashing
- Protected routes
- Role-based authorization

---

### Role Management

Three different user roles are supported:

- Administrator
- Teacher
- Student

Each role has its own dashboard and permissions.

---

### Course Management

Teachers can:

- Create courses
- Edit course information
- Delete courses
- Upload course details
- Manage enrolled students

Students can:

- Browse available courses
- View course details
- Enroll in courses

---

### Enrollment System

- Student course enrollment
- Persistent enrolled-course tracking
- Individual course access
- Enrollment validation

---

### Learning Progress Tracking

- Student progress monitoring
- Teacher-controlled progress updates
- Progress percentage display
- Visual progress indicators

---

### Comment System

Students can:

- Post comments
- Participate in discussions
- Interact with course content

---

### Recommendation Engine

A rule-based recommendation system suggests courses based on user interests and learning behavior.

---

### Responsive User Interface

- Bootstrap-based responsive design
- Modern dashboard layouts
- Mobile-friendly interface
- Clean navigation
- User-friendly experience

---

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)

### Frontend

- HTML5
- CSS3
- JavaScript
- Bootstrap
- EJS Template Engine

### Tools

- Git
- GitHub
- npm

---

## Project Structure

```
LMS/
│
├── controllers/
├── middleware/
├── models/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── routes/
├── views/
├── config/
├── app.js
├── package.json
└── README.md
```

---

## Main Modules

- Authentication Module
- User Management
- Course Module
- Enrollment Module
- Progress Tracking Module
- Comment Module
- Recommendation Module

---

## Security Features

- JWT Authentication
- Password Hashing
- Protected Routes
- Role-Based Access Control
- Input Validation
- Error Handling

---

## Database

The application uses MongoDB for data storage.

Main collections include:

- Users
- Courses
- Enrollments
- Comments
- Progress Records

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/lms-project.git
```

### Navigate to the project

```bash
cd lms-project
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file and configure the required environment variables.

Example:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

### Start the application

```bash
npm start
```

or

```bash
npm run dev
```

---

## Screenshots

You can add screenshots of:

- Home Page
- Login Page
- Student Dashboard
- Teacher Dashboard
- Course Details
- Progress Tracking
- Enrollment Page

Example:

```
screenshots/
    home.png
    login.png
    dashboard.png
```

---

## Future Improvements

Potential future enhancements include:

- Video streaming support
- Online quizzes and exams
- Assignment submission
- Certificate generation
- Live classes
- Email notifications
- Payment gateway integration
- Real-time chat
- Advanced analytics
- AI-powered course recommendations

---

## Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack web development
- RESTful API design
- Authentication and Authorization
- Database modeling
- MVC Architecture
- Git version control
- Responsive web design
- Software debugging
- Project organization
- Clean code practices

---

## Author

**Jawad**

Computer Engineering Graduate

GitHub:
https://github.com/yourusername

---

## License

This project was developed for educational purposes as a graduation project.
