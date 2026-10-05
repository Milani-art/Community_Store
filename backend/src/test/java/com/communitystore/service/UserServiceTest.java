package com.communitystore.service;

import com.communitystore.dto.AuthDtos;
import com.communitystore.dto.UserDtos;
import com.communitystore.exception.BadRequestException;
import com.communitystore.exception.ForbiddenException;
import com.communitystore.exception.ResourceNotFoundException;
import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.model.VerificationStatus;
import com.communitystore.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserService userService;

    private User resident(VerificationStatus status) {
        return User.builder().id(4L).email("david@community.org").fullName("David Miller")
                .password("HASHED").role(Role.RESIDENT)
                .verificationStatus(status).verified(status == VerificationStatus.APPROVED).build();
    }

    private void saveReturnsItsArgument() {
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ---------- verification ----------

    @Test
    void approveVerification_marksUserVerified() {
        User user = resident(VerificationStatus.PENDING);
        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        saveReturnsItsArgument();

        AuthDtos.UserSummaryDto result = userService.approveVerification(4L).getData();

        assertTrue(result.isVerified());
        assertEquals(VerificationStatus.APPROVED, result.getVerificationStatus());
    }

    @Test
    void rejectVerification_storesReasonAndRemovesVerifiedFlag() {
        User user = resident(VerificationStatus.APPROVED);
        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        saveReturnsItsArgument();

        userService.rejectVerification(4L, "Business registration number not found");

        assertFalse(user.isVerified());
        assertEquals(VerificationStatus.REJECTED, user.getVerificationStatus());
        assertEquals("Business registration number not found", user.getVerificationNote());
    }

    @Test
    void rejectVerification_refusesAdminAccounts() {
        User admin = User.builder().id(5L).role(Role.ADMIN).verified(true)
                .verificationStatus(VerificationStatus.APPROVED).build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(admin));

        assertThrows(BadRequestException.class, () -> userService.rejectVerification(5L, null));
        verify(userRepository, never()).save(any());
    }

    @Test
    void approveVerification_unknownUser_isNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.approveVerification(99L));
    }

    @Test
    void requestVerification_movesRejectedUserBackToPendingAndClearsNote() {
        User user = resident(VerificationStatus.REJECTED);
        user.setVerificationNote("Old reason");
        when(userRepository.findByEmail("david@community.org")).thenReturn(Optional.of(user));
        saveReturnsItsArgument();

        userService.requestVerification("david@community.org");

        assertEquals(VerificationStatus.PENDING, user.getVerificationStatus());
        assertNull(user.getVerificationNote());
    }

    @Test
    void requestVerification_whenAlreadyApproved_isBadRequest() {
        when(userRepository.findByEmail("david@community.org"))
                .thenReturn(Optional.of(resident(VerificationStatus.APPROVED)));

        assertThrows(BadRequestException.class, () -> userService.requestVerification("david@community.org"));
    }

    // ---------- requireVerified ----------

    @Test
    void requireVerified_blocksUnverifiedUser() {
        assertThrows(ForbiddenException.class,
                () -> userService.requireVerified(resident(VerificationStatus.PENDING)));
    }

    @Test
    void requireVerified_allowsVerifiedUserAndAdmin() {
        User admin = User.builder().role(Role.ADMIN).build();

        assertDoesNotThrow(() -> userService.requireVerified(resident(VerificationStatus.APPROVED)));
        assertDoesNotThrow(() -> userService.requireVerified(admin));
    }

    // ---------- password ----------

    @Test
    void changeMyPassword_withWrongCurrentPassword_isBadRequest() {
        when(userRepository.findByEmail("david@community.org"))
                .thenReturn(Optional.of(resident(VerificationStatus.APPROVED)));
        when(passwordEncoder.matches("wrong", "HASHED")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.changeMyPassword(
                "david@community.org", new UserDtos.ChangePasswordRequest("wrong", "newpass1")));
        verify(userRepository, never()).save(any());
    }

    @Test
    void changeMyPassword_storesTheNewPasswordHashed() {
        User user = resident(VerificationStatus.APPROVED);
        when(userRepository.findByEmail("david@community.org")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldpass1", "HASHED")).thenReturn(true);
        when(passwordEncoder.encode("newpass1")).thenReturn("NEW-HASH");

        userService.changeMyPassword("david@community.org",
                new UserDtos.ChangePasswordRequest("oldpass1", "newpass1"));

        assertEquals("NEW-HASH", user.getPassword());
        verify(userRepository).save(user);
    }
}
