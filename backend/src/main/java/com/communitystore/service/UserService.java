
package com.communitystore.service;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.dto.UserDtos;
import com.communitystore.exception.BadRequestException;
import com.communitystore.exception.ForbiddenException;
import com.communitystore.exception.ResourceNotFoundException;
import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.model.VerificationStatus;
import com.communitystore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Profile management and the identity verification flow. */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ---------- helpers other services can reuse ----------

    /** Loads the logged-in user. Controllers pass authentication.getName(), which is the email. */
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /** Call this at the top of any action that only verified members may perform. */
    public void requireVerified(User user) {
        if (user.getRole() != Role.ADMIN && !user.isVerified()) {
            throw new ForbiddenException("Your account must be verified before you can do this");
        }
    }

    // ---------- the logged-in user's own account ----------

    public ApiResponse<UserDtos.ProfileResponse> getMyProfile(String email) {
        return ApiResponse.success("Profile retrieved", UserDtos.ProfileResponse.from(getByEmail(email)));
    }

    @Transactional
    public ApiResponse<UserDtos.ProfileResponse> updateMyProfile(
            String email,
            UserDtos.UpdateProfileRequest request) {

        User user = getByEmail(email);

        user.setFullName(request.getFullName().trim());
        user.setInstitutionOrBusiness(request.getInstitutionOrBusiness());
        user.setProfileImage(request.getProfileImage());

        return ApiResponse.success(
                "Profile updated",
                UserDtos.ProfileResponse.from(userRepository.save(user))
        );
    }

    @Transactional
    public ApiResponse<Void> changeMyPassword(
            String email,
            UserDtos.ChangePasswordRequest request) {

        User user = getByEmail(email);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        return ApiResponse.success("Password changed", null);
    }

    /** A rejected user fixes their details, then puts themselves back in the admin queue. */
    @Transactional
    public ApiResponse<UserDtos.ProfileResponse> requestVerification(String email) {

        User user = getByEmail(email);

        if (user.getVerificationStatus() == VerificationStatus.APPROVED) {
            throw new BadRequestException("Your account is already verified");
        }

        setStatus(user, VerificationStatus.PENDING, null);

        return ApiResponse.success(
                "Verification requested",
                UserDtos.ProfileResponse.from(userRepository.save(user))
        );
    }

    // ---------- admin ----------

    public ApiResponse<List<AuthDtos.UserSummaryDto>> getAllUsers() {

        List<AuthDtos.UserSummaryDto> dtos =
                userRepository.findAll()
                        .stream()
                        .map(AuthDtos.UserSummaryDto::from)
                        .toList();

        return ApiResponse.success("Users retrieved", dtos);
    }

    public ApiResponse<List<AuthDtos.UserSummaryDto>> getPendingVerifications() {

        List<AuthDtos.UserSummaryDto> dtos =
                userRepository
                        .findByVerificationStatusOrderByCreatedAtAsc(
                                VerificationStatus.PENDING)
                        .stream()
                        .map(AuthDtos.UserSummaryDto::from)
                        .toList();

        return ApiResponse.success(
                "Pending verifications retrieved",
                dtos
        );
    }

    @Transactional
    public ApiResponse<AuthDtos.UserSummaryDto> approveVerification(Long userId) {

        User user = getById(userId);

        setStatus(user, VerificationStatus.APPROVED, null);

        return ApiResponse.success(
                "User verified successfully",
                AuthDtos.UserSummaryDto.from(userRepository.save(user))
        );
    }

    @Transactional
    public ApiResponse<AuthDtos.UserSummaryDto> rejectVerification(
            Long userId,
            String reason) {

        User user = getById(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException(
                    "An admin account cannot be rejected"
            );
        }

        setStatus(user, VerificationStatus.REJECTED, reason);

        return ApiResponse.success(
                "User verification rejected",
                AuthDtos.UserSummaryDto.from(userRepository.save(user))
        );
    }

    // ---------- admin user management ----------

    @Transactional
    public ApiResponse<AuthDtos.UserSummaryDto> banUser(Long userId) {

        User user = getById(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException(
                    "An admin account cannot be banned"
            );
        }

        if (user.isBanned()) {
            throw new BadRequestException(
                    "User is already banned"
            );
        }

        user.setBanned(true);

        return ApiResponse.success(
                "User banned successfully",
                AuthDtos.UserSummaryDto.from(userRepository.save(user))
        );
    }

    @Transactional
    public ApiResponse<AuthDtos.UserSummaryDto> unbanUser(Long userId) {

        User user = getById(userId);

        if (!user.isBanned()) {
            throw new BadRequestException(
                    "User is not banned"
            );
        }

        user.setBanned(false);

        return ApiResponse.success(
                "User unbanned successfully",
                AuthDtos.UserSummaryDto.from(userRepository.save(user))
        );
    }

    @Transactional
    public ApiResponse<Void> deleteUser(Long userId) {

        User user = getById(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException(
                    "An admin account cannot be deleted"
            );
        }

        userRepository.delete(user);

        return ApiResponse.success(
                "User deleted successfully",
                null
        );
    }

    // ---------- private ----------

    private User getById(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );
    }

    /** The only place that changes verification, so "verified" and the status can never disagree. */
    private void setStatus(
            User user,
            VerificationStatus status,
            String note) {

        user.setVerificationStatus(status);
        user.setVerified(
                status == VerificationStatus.APPROVED
        );
        user.setVerificationNote(note);
    }
}
