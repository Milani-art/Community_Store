package com.communitystore.controller;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.dto.UserDtos;
import com.communitystore.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controllers stay thin: read the request, call one service method, return the result.
 * "Authentication" is filled in by JwtAuthFilter; getName() is the logged-in user's email.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ---------- the logged-in user ----------

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDtos.ProfileResponse>> getMyProfile(
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.getMyProfile(authentication.getName())
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDtos.ProfileResponse>> updateMyProfile(
            @Valid @RequestBody UserDtos.UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.updateMyProfile(authentication.getName(), request)
        );
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changeMyPassword(
            @Valid @RequestBody UserDtos.ChangePasswordRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.changeMyPassword(authentication.getName(), request)
        );
    }

    @PostMapping("/me/request-verification")
    public ResponseEntity<ApiResponse<UserDtos.ProfileResponse>> requestVerification(
            Authentication authentication) {
        return ResponseEntity.ok(
                userService.requestVerification(authentication.getName())
        );
    }

    // ---------- admin only ----------

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuthDtos.UserSummaryDto>>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/pending-verification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuthDtos.UserSummaryDto>>> getPendingVerifications() {
        return ResponseEntity.ok(userService.getPendingVerifications());
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthDtos.UserSummaryDto>> verifyUser(
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.approveVerification(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthDtos.UserSummaryDto>> rejectUser(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) UserDtos.RejectRequest request) {

        String reason = request != null ? request.getReason() : null;

        return ResponseEntity.ok(
                userService.rejectVerification(id, reason)
        );
    }

    // ---------- admin user management ----------

    @PutMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthDtos.UserSummaryDto>> banUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.banUser(id)
        );
    }

    @PutMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthDtos.UserSummaryDto>> unbanUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.unbanUser(id)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.deleteUser(id)
        );
    }
}
