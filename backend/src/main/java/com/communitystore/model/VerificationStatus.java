package com.communitystore.model;

/** Where a user is in the identity verification flow. */
public enum VerificationStatus {
    PENDING,   // waiting for an admin to review
    APPROVED,  // verified: may post and sell
    REJECTED   // an admin said no; the user can fix their details and re-apply
}
