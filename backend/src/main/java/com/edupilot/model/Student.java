package com.edupilot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.Instant;

@Entity
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(columnNames = "studentCode"),
    @UniqueConstraint(columnNames = "user_id")
})
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false, unique = true, length = 30)
    private String studentCode;
    @NotBlank @Column(nullable = false, length = 120)
    private String fullName;
    @Min(16) @Max(100)
    private Integer age;
    @NotBlank @Column(nullable = false, length = 80)
    private String branch;
    @Min(1) @Max(8) @Column(nullable = false)
    private Integer yearOfStudy;
    @DecimalMin("0.0") @DecimalMax("100.0")
    @Column(nullable = false)
    private Double marks = 0.0;
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Student() {}
    public Long getId() { return id; }
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public Integer getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(Integer yearOfStudy) { this.yearOfStudy = yearOfStudy; }
    public Double getMarks() { return marks; }
    public void setMarks(Double marks) { this.marks = marks; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public Instant getCreatedAt() { return createdAt; }
}
