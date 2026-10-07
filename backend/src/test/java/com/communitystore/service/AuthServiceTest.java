package com.communitystore.service;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.exception.BadRequestException;
import com.communitystore.exception.ConflictException;
import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.repository.UserRepository;
import com.communitystore.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests: no Spring, no database. Every dependency is a Mockito mock,
 * so each test checks one rule of AuthService in isolation and runs in milliseconds.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtils jwtUtils;

    @InjectMocks private AuthService authService;

    private AuthDtos.RegisterRequest registerRequest(String email, Role role) {
        return new AuthDtos.RegisterRequest(email, "secret1", "Thabo Nkosi", role, "Faculty of IT");
    }

    @Test
    void register_savesUserWithHashedPasswordAndLowercaseEmail() {
        when(userRepository.existsByEmail("thabo@campus.ac.za")).thenReturn(false);
        when(passwordEncoder.encode("secret1")).thenReturn("HASHED");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApiResponse<AuthDtos.UserSummaryDto> response =
                authService.register(registerRequest("  Thabo@Campus.ac.za ", Role.STUDENT));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertEquals("thabo@campus.ac.za", saved.getValue().getEmail());
        assertEquals("HASHED", saved.getValue().getPassword());
        assertTrue(response.isSuccess());
        assertEquals("thabo@campus.ac.za", response.getData().getEmail());
    }

    @Test
    void register_rejectsAdminRole() {
        assertThrows(BadRequestException.class,
                () -> authService.register(registerRequest("hacker@campus.ac.za", Role.ADMIN)));

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_rejectsDuplicateEmail() {
        when(userRepository.existsByEmail("thabo@campus.ac.za")).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> authService.register(registerRequest("thabo@campus.ac.za", Role.STUDENT)));

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_returnsTokenAndUserDetails() {
        User user = User.builder().id(7L).email("thabo@campus.ac.za").fullName("Thabo Nkosi")
                .role(Role.STUDENT).verified(true).rating(5.0).build();
        when(userRepository.findByEmail("thabo@campus.ac.za")).thenReturn(Optional.of(user));
        when(jwtUtils.generateJwtToken("thabo@campus.ac.za")).thenReturn("jwt-token");

        ApiResponse<AuthDtos.JwtResponse> response =
                authService.login(new AuthDtos.LoginRequest("Thabo@campus.ac.za", "secret1"));

        assertEquals("jwt-token", response.getData().getToken());
        assertEquals(7L, response.getData().getId());
        assertEquals(Role.STUDENT, response.getData().getRole());
    }

    @Test
    void login_withWrongPassword_issuesNoToken() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new AuthDtos.LoginRequest("thabo@campus.ac.za", "wrong")));

        verify(jwtUtils, never()).generateJwtToken(any());
    }
}
