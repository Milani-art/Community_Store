package com.communitystore.service;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.dto.BulletinDto;
import com.communitystore.exception.BadRequestException;
import com.communitystore.exception.ForbiddenException;
import com.communitystore.exception.ResourceNotFoundException;
import com.communitystore.model.BulletinPost;
import com.communitystore.model.PostType;
import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.repository.BulletinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BulletinService {

    private final BulletinRepository bulletinRepository;
    private final UserService userService;

    // ---------- read (public) ----------

    /** All posts, newest first. "type" is optional: /bulletin?type=EVENT */
    public ApiResponse<List<BulletinDto.Response>> getPosts(String type) {
        List<BulletinPost> posts = (type == null || type.isBlank())
                ? bulletinRepository.findAllByOrderByCreatedAtDesc()
                : bulletinRepository.findByPostTypeOrderByCreatedAtDesc(parsePostType(type).name());
        return ApiResponse.success("Bulletin posts retrieved", toResponses(posts));
    }

    public ApiResponse<BulletinDto.Response> getPostById(Long id) {
        return ApiResponse.success("Bulletin post found", mapToResponse(findPost(id)));
    }

    public ApiResponse<List<BulletinDto.Response>> getMyPosts(String userEmail) {
        User author = userService.getByEmail(userEmail);
        List<BulletinPost> posts = bulletinRepository.findByAuthorIdOrderByCreatedAtDesc(author.getId());
        return ApiResponse.success("Your bulletin posts retrieved", toResponses(posts));
    }

    // ---------- write (logged-in users) ----------

    @Transactional
    public ApiResponse<BulletinDto.Response> createPost(BulletinDto.CreateRequest request, String userEmail) {
        User author = userService.getByEmail(userEmail);
        userService.requireVerified(author); // unverified accounts may read but not post

        BulletinPost post = BulletinPost.builder().author(author).build();
        applyRequest(post, request);

        BulletinPost savedPost = bulletinRepository.save(post);
        return ApiResponse.success("Bulletin post published successfully", mapToResponse(savedPost));
    }

    /** Only the author may edit their post. */
    @Transactional
    public ApiResponse<BulletinDto.Response> updatePost(Long id, BulletinDto.CreateRequest request, String userEmail) {
        User user = userService.getByEmail(userEmail);
        BulletinPost post = findPost(id);

        if (!isAuthor(post, user)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        applyRequest(post, request);
        return ApiResponse.success("Bulletin post updated", mapToResponse(bulletinRepository.save(post)));
    }

    /** The author may delete their post; an admin may delete any post (moderation). */
    @Transactional
    public ApiResponse<Void> deletePost(Long id, String userEmail) {
        User user = userService.getByEmail(userEmail);
        BulletinPost post = findPost(id);

        if (!isAuthor(post, user) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You can only delete your own posts");
        }

        bulletinRepository.delete(post);
        return ApiResponse.success("Bulletin post deleted", null);
    }

    // ---------- mapping ----------

    public BulletinDto.Response mapToResponse(BulletinPost post) {
        return BulletinDto.Response.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .postType(post.getPostType())
                .tags(post.getTags())
                .author(AuthDtos.UserSummaryDto.from(post.getAuthor()))
                .eventDate(post.getEventDate() != null ? post.getEventDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "")
                .build();
    }

    // ---------- private ----------

    private List<BulletinDto.Response> toResponses(List<BulletinPost> posts) {
        return posts.stream().map(this::mapToResponse).toList();
    }

    private BulletinPost findPost(Long id) {
        return bulletinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bulletin post not found with id: " + id));
    }

    private boolean isAuthor(BulletinPost post, User user) {
        return post.getAuthor().getId().equals(user.getId());
    }

    /** Copies the request onto the entity. Shared by create and update so both follow the same rules. */
    private void applyRequest(BulletinPost post, BulletinDto.CreateRequest request) {
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());
        post.setPostType(parsePostType(request.getPostType()).name());
        post.setTags(request.getTags());
        post.setEventDate(parseEventDate(request.getEventDate()));
    }

    /** No type means ANNOUNCEMENT; an unknown type is a 400, not a silently saved typo. */
    private PostType parsePostType(String value) {
        if (value == null || value.isBlank()) {
            return PostType.ANNOUNCEMENT;
        }
        try {
            return PostType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid post type. Use ANNOUNCEMENT, EVENT, SERVICE_OFFER or FUNDRAISER");
        }
    }

    /** Accepts 2026-10-05T14:30 or 2026-10-05T14:30:00 (what an HTML datetime-local input sends). */
    private LocalDateTime parseEventDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim());
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid event date. Use the format 2026-10-05T14:30");
        }
    }
}
