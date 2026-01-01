package com.catalogue.user.config;

import com.catalogue.user.entity.User;
import com.catalogue.user.entity.UserRole;
import com.catalogue.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@marketplace.com")) {
            User admin = User.builder()
                    .email("admin@marketplace.com")
                    .firstName("Admin")
                    .lastName("User")
                    .password(passwordEncoder.encode("admin123"))
                    .role(UserRole.ADMIN)
                    .active(true)
                    .phoneNumber("+1234567890")
                    .address("123 Admin Street, Admin City")
                    .build();
            userRepository.save(admin);
            log.info("Created admin user: admin@marketplace.com / admin123");
        }

        // Create a test client user if not exists
        if (!userRepository.existsByEmail("client@marketplace.com")) {
            User client = User.builder()
                    .email("client@marketplace.com")
                    .firstName("John")
                    .lastName("Doe")
                    .password(passwordEncoder.encode("client123"))
                    .role(UserRole.CLIENT)
                    .active(true)
                    .phoneNumber("+0987654321")
                    .address("456 Client Avenue, Client Town")
                    .build();
            userRepository.save(client);
            log.info("Created client user: client@marketplace.com / client123");
        }

        log.info("Data initialization complete!");
        log.info("Test credentials:");
        log.info("  Admin: admin@marketplace.com / admin123");
        log.info("  Client: client@marketplace.com / client123");
    }
}

