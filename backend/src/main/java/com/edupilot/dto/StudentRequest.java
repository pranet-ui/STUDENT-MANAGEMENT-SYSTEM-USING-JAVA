package com.edupilot.dto;

import jakarta.validation.constraints.*;

public record StudentRequest(
    @NotBlank String studentCode,
    @NotBlank String fullName,
    @Min(16) @Max(100) Integer age,
    @NotBlank String branch,
    @Min(1) @Max(8) Integer yearOfStudy,
    @DecimalMin("0.0") @DecimalMax("100.0") Double marks,
    @Email @NotBlank String email,
    @NotBlank @Size(min=8, max=100) String password
) {}
