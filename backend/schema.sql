CREATE DATABASE IF NOT EXISTS edupilot;
USE edupilot;

-- Spring Boot/JPA creates and updates these tables from the entity definitions.
-- Logical schema:
-- users(id PK, email UNIQUE, password_hash, role, created_at)
-- students(id PK, student_code UNIQUE, full_name, age, branch, year_of_study,
--          marks, user_id UNIQUE FK -> users.id, created_at)
