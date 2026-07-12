package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.JwtResponse;
import com.odoo.assetflow.dto.LoginRequest;
import com.odoo.assetflow.dto.SignupRequest;
import com.odoo.assetflow.model.User;
import com.odoo.assetflow.model.enums.Role;
import com.odoo.assetflow.repository.UserRepository;
import com.odoo.assetflow.security.CustomUserDetails;
import com.odoo.assetflow.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getUser().getId(),
                userDetails.getUser().getName(),
                userDetails.getUser().getEmail(),
                userDetails.getUser().getRole().name()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        // Explicitly format as {bcrypt} since we use DelegatingPasswordEncoder
        User user = new User(signUpRequest.name(),
                             signUpRequest.email(),
                             "{bcrypt}" + encoder.encode(signUpRequest.password()).replace("{bcrypt}", ""),
                             Role.EMPLOYEE); // All signups are basic employees by default

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
