package com.communitystore.dto;

import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.model.VerificationStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        private String password;

        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotNull(message = "Role is required")
        private Role role;

        private String institutionOrBusiness;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class JwtResponse {
        private String token;
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private boolean verified;
        private double rating;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserSummaryDto {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private String institutionOrBusiness;
        private boolean verified;
        private VerificationStatus verificationStatus;
        private double rating;
        private int totalRatings;

        /** Entity -> DTO. Keeps the password and other private fields out of responses. */
        public static UserSummaryDto from(User user) {
            return UserSummaryDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .institutionOrBusiness(user.getInstitutionOrBusiness())
                    .verified(user.isVerified())
                    .verificationStatus(user.getVerificationStatus())
                    .rating(user.getRating())
                    .totalRatings(user.getTotalRatings())
                    .build();
        }
    }
}
