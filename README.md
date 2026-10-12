# EduPilot — Student Management System

Advanced starter implementation using React + Java Spring Boot + MySQL.

## Features
- Separate Admin and Student login flows
- JWT authentication
- BCrypt password hashing
- Admin-only student CRUD
- Student users can view their own profile and academic information
- Search/filter student records
- Dark dashboard UI
- MySQL persistence through Spring Data JPA

## Requirements
- Java 17+
- Node.js 20+
- MySQL 8+
- Maven 3.9+

## 1. Configure MySQL
Create a database:
```sql
CREATE DATABASE edupilot;
```

Set environment variables before starting the backend, or edit `backend/src/main/resources/application.properties`:
- `DB_URL` (default `jdbc:mysql://localhost:3306/edupilot`)
- `DB_USERNAME` (default `root`)
- `DB_PASSWORD`
- `JWT_SECRET` (use a long random secret; minimum 32 bytes)
- `ADMIN_EMAIL` (default `admin@edupilot.local`)
- `ADMIN_PASSWORD` (default `ChangeMe123!` — change this immediately)

The application creates the initial admin account if it does not exist. Do not use the sample password in production.

## 2. Start the backend
```bash
cd backend
mvn spring-boot:run
```
Backend: `http://localhost:8080`

## 3. Start the frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

## Demo workflow
1. Sign in with the configured admin email/password.
2. Add a student record and set a temporary password.
3. Sign in through the Student portal using the student's email and temporary password.
4. Students can view only their own profile.

## API overview
- `POST /api/auth/login` — login; body `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` — current authenticated user
- `GET /api/students` — admin only; optional `?q=...`
- `POST /api/students` — admin only
- `GET /api/students/me` — student profile for the logged-in student
- `GET /api/students/{id}` — admin only
- `PUT /api/students/{id}` — admin only
- `DELETE /api/students/{id}` — admin only

## Important production hardening
This is a project starter, not a production-certified system. Before deployment:
- Use HTTPS and a strong secret from a secret manager.
- Replace localStorage token storage with secure, HttpOnly cookies or another reviewed token strategy.
- Add rate limiting, password reset, email verification, audit logs, backups, and account lockout.
- Add pagination and validation rules suited to your institution.
- Restrict CORS to the real frontend origin.
- Review privacy and data-retention requirements.