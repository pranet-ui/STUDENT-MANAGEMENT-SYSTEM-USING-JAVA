package com.edupilot.repo;

import com.edupilot.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    boolean existsByStudentCodeIgnoreCase(String studentCode);
    List<Student> findByStudentCodeContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrBranchContainingIgnoreCase(
        String code, String name, String branch);
}
