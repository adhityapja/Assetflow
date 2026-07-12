package com.odoo.assetflow.service;

import com.odoo.assetflow.model.User;
import com.odoo.assetflow.model.enums.Role;
import com.odoo.assetflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(String name, String email, String rawPassword, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        User user = new User(name, email, passwordEncoder.encode(rawPassword), role);
        return userRepository.save(user);
    }

    public User updateUser(Long id, Role role, Boolean isActive, Long departmentId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (role != null) user.setRole(role);
        if (isActive != null) user.setIsActive(isActive);
        user.setDepartmentId(departmentId); // Can be null
        return userRepository.save(user);
    }
}
