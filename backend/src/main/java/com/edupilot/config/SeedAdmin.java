package com.edupilot.config;

import com.edupilot.model.AppUser;
import com.edupilot.model.Role;
import com.edupilot.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedAdmin {
    @Bean
    CommandLineRunner createInitialAdmin(UserRepository users, PasswordEncoder encoder,
        @Value("${app.admin.email}") String email,
        @Value("${app.admin.password}") String password) {
        return args -> {
            if (!users.existsByEmailIgnoreCase(email)) {
                users.save(new AppUser(email.trim().toLowerCase(), encoder.encode(password), Role.ADMIN));
                System.out.println("Initial admin created for: " + email);
            }
        };
    }
}
