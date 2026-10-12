package com.edupilot.dto;

import com.edupilot.model.Student;

public record StudentResponse(Long id, String studentCode, String fullName, Integer age,
                              String branch, Integer yearOfStudy, Double marks, String email) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(s.getId(), s.getStudentCode(), s.getFullName(), s.getAge(),
            s.getBranch(), s.getYearOfStudy(), s.getMarks(), s.getUser().getEmail());
    }
}
