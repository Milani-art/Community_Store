package com.communitystore.repository;

import com.communitystore.model.BulletinPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulletinRepository extends JpaRepository<BulletinPost, Long> {

    List<BulletinPost> findAllByOrderByCreatedAtDesc();

    List<BulletinPost> findByPostTypeOrderByCreatedAtDesc(String postType);

    List<BulletinPost> findByAuthorId(Long authorId);

    List<BulletinPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
