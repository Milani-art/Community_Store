package com.communitystore.repository;

import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByVerifiedFalse();

    List<User> findByVerificationStatusOrderByCreatedAtAsc(VerificationStatus status);
}
