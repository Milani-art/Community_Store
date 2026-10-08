package com.communitystore.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String institutionOrBusiness;

    /** Kept in step with verificationStatus: true only when the status is APPROVED. */
    private boolean verified;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    /** Reason an admin gave when rejecting the verification, shown to the user. */
    @Column(length = 500)
    private String verificationNote;

    private double rating;

    private int totalRatings;

    private String profileImage;

    private boolean banned;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Students with a university email are verified automatically.
        if (role == Role.STUDENT && email != null && (email.endsWith(".ac.za") || email.endsWith(".edu"))) {
            this.verified = true;
        }
        if (verificationStatus == null) {
            verificationStatus = verified ? VerificationStatus.APPROVED : VerificationStatus.PENDING;
        }
        this.verified = (verificationStatus == VerificationStatus.APPROVED);
    }
}
