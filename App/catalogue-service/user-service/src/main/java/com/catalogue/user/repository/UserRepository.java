package com.catalogue.user.repository;

import com.catalogue.user.entity.User;
import com.catalogue.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(UserRole role);

    List<User> findByActiveTrue();

    List<User> findByRoleAndActiveTrue(UserRole role);

    boolean existsByEmail(String email);
}

