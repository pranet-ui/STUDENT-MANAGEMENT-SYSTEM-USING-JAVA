package com.edupilot.controller;

import com.edupilot.dto.LoginRequest;
import com.edupilot.model.AppUser;
import com.edupilot.repo.UserRepository;
import com.edupilot.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCase(request.email())
            .filter(u -> encoder.matches(request.password(), u.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return Map.of("token", jwt.generate(user), "role", user.getRole().name(),
                      "email", user.getEmail());
    }

    @GetMapping("/me")
    public Map<String, Object> me(org.springframework.security.core.Authentication auth) {
        AppUser user = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        return Map.of("id", user.getId(), "email", user.getEmail(), "role", user.getRole().name());
    }
}
