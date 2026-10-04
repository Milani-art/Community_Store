package com.communitystore.dto;

import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.model.VerificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

public class UserDtos {

    /** PUT /users/me - only the fields a user may change about themselves. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        private String fullName;

        @Size(max = 255, message = "Institution or business must be at most 255 characters")
        private String institutionOrBusiness;

        @Size(max = 255, message = "Profile image URL must be at most 255 characters")
        private String profileImage;
    }

    /** PUT /users/me/password */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        private String newPassword;
    }

    /** PUT /users/{id}/reject - the reason is optional. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RejectRequest {
        @Size(max = 500, message = "Reason must be at most 500 characters")
        private String reason;
    }

    /** The logged-in user's own profile: the public summary plus private details. */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProfileResponse {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private String institutionOrBusiness;
        private boolean verified;
        private VerificationStatus verificationStatus;
        private String verificationNote;
        private double rating;
        private int totalRatings;
        private String profileImage;
        private String createdAt;

        public static ProfileResponse from(User user) {
            return ProfileResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole())
                    .institutionOrBusiness(user.getInstitutionOrBusiness())
                    .verified(user.isVerified())
                    .verificationStatus(user.getVerificationStatus())
                    .verificationNote(user.getVerificationNote())
                    .rating(user.getRating())
                    .totalRatings(user.getTotalRatings())
                    .profileImage(user.getProfileImage())
                    .createdAt(user.getCreatedAt() != null
                            ? user.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null)
                    .build();
        }
    }
}
