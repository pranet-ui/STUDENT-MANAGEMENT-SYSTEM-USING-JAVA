package com.edupilot.controller;

import com.edupilot.dto.*;
import com.edupilot.model.*;
import com.edupilot.repo.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentRepository students;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public StudentController(StudentRepository students, UserRepository users, PasswordEncoder encoder) {
        this.students = students; this.users = users; this.encoder = encoder;
    }

    @GetMapping
    public List<StudentResponse> all(@RequestParam(required = false) String q) {
        List<Student> result = (q == null || q.isBlank()) ? students.findAll()
            : students.findByStudentCodeContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrBranchContainingIgnoreCase(q, q, q);
        return result.stream().map(StudentResponse::from).toList();
    }

    @GetMapping("/me")
    public StudentResponse mine(Authentication auth) {
        AppUser user = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        Student student = students.findByUserId(user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
        return StudentResponse.from(student);
    }

    @GetMapping("/{id}")
    public StudentResponse one(@PathVariable Long id) {
        return StudentResponse.from(students.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse create(@Valid @RequestBody StudentRequest request) {
        if (users.existsByEmailIgnoreCase(request.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        if (students.existsByStudentCodeIgnoreCase(request.studentCode()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student ID already exists");
        AppUser user = users.save(new AppUser(request.email().trim().toLowerCase(),
            encoder.encode(request.password()), Role.STUDENT));
        Student s = new Student();
        fill(s, request); s.setUser(user);
        return StudentResponse.from(students.save(s));
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        Student s = students.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        if (!s.getUser().getEmail().equalsIgnoreCase(request.email()) &&
            users.existsByEmailIgnoreCase(request.email()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        if (!s.getStudentCode().equalsIgnoreCase(request.studentCode()) &&
            students.existsByStudentCodeIgnoreCase(request.studentCode()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student ID already exists");
        s.getUser().setEmail(request.email().trim().toLowerCase());
        // Admin-supplied password is treated as a reset password.
        s.getUser().setPasswordHash(encoder.encode(request.password()));
        users.save(s.getUser());
        fill(s, request);
        return StudentResponse.from(students.save(s));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Student s = students.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        AppUser user = s.getUser();
        students.delete(s);
        users.delete(user);
    }

    private void fill(Student s, StudentRequest r) {
        s.setStudentCode(r.studentCode().trim());
        s.setFullName(r.fullName().trim());
        s.setAge(r.age());
        s.setBranch(r.branch().trim());
        s.setYearOfStudy(r.yearOfStudy());
        s.setMarks(r.marks() == null ? 0.0 : r.marks());
    }
}
