package com.communitystore.controller;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDtos.JwtResponse>> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDtos.UserSummaryDto>> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
}
