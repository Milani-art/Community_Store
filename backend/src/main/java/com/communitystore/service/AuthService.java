package com.communitystore.service;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.exception.BadRequestException;
import com.communitystore.exception.ConflictException;
import com.communitystore.exception.ResourceNotFoundException;
import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.repository.UserRepository;
import com.communitystore.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

/** Registration and login. Everything about an existing account lives in UserService. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public ApiResponse<AuthDtos.JwtResponse> login(AuthDtos.LoginRequest request) {
        String email = normaliseEmail(request.getEmail());

        // Throws BadCredentialsException if the email or password is wrong -> 401 (GlobalExceptionHandler).
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AuthDtos.JwtResponse response = AuthDtos.JwtResponse.builder()
                .token(jwtUtils.generateJwtToken(email))
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .verified(user.isVerified())
                .rating(user.getRating())
                .build();

        return ApiResponse.success("Login successful", response);
    }

    public ApiResponse<AuthDtos.UserSummaryDto> register(AuthDtos.RegisterRequest request) {
        // The role comes from the request body, so without this check anyone could make themselves an admin.
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be self-registered");
        }

        String email = normaliseEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword())) // never store the plain password
                .fullName(request.getFullName().trim())
                .role(request.getRole())
                .institutionOrBusiness(request.getInstitutionOrBusiness())
                .rating(5.0)
                .totalRatings(0)
                .build();

        User savedUser = userRepository.save(user);

        return ApiResponse.success("User registered successfully", mapToSummary(savedUser));
    }

    /** Kept here because ProductService and OrderService call it. */
    public AuthDtos.UserSummaryDto mapToSummary(User user) {
        return AuthDtos.UserSummaryDto.from(user);
    }

    /** "Sarah@Campus.ac.za " and "sarah@campus.ac.za" must be the same account. */
    private String normaliseEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
