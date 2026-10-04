package com.communitystore.service;

import com.communitystore.dto.BulletinDto;
import com.communitystore.exception.BadRequestException;
import com.communitystore.exception.ForbiddenException;
import com.communitystore.exception.ResourceNotFoundException;
import com.communitystore.model.BulletinPost;
import com.communitystore.model.Role;
import com.communitystore.model.User;
import com.communitystore.repository.BulletinRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BulletinServiceTest {

    private static final String AUTHOR_EMAIL = "sarah@campus.ac.za";

    @Mock private BulletinRepository bulletinRepository;
    @Mock private UserService userService;

    @InjectMocks private BulletinService bulletinService;

    private final User author = User.builder().id(1L).email(AUTHOR_EMAIL).fullName("Sarah Jenkins")
            .role(Role.STUDENT).verified(true).build();
    private final User stranger = User.builder().id(2L).email("vendor@shop.co.za").fullName("Vendor")
            .role(Role.VENDOR).verified(true).build();
    private final User admin = User.builder().id(3L).email("admin@communitystore.org").fullName("Admin")
            .role(Role.ADMIN).verified(true).build();

    private BulletinDto.CreateRequest request(String postType, String eventDate) {
        return new BulletinDto.CreateRequest("Textbook swap", "Bring your old books.", postType, "Books", eventDate);
    }

    private BulletinPost existingPost() {
        return BulletinPost.builder().id(10L).title("Old title").content("Old content")
                .postType("ANNOUNCEMENT").author(author).build();
    }

    private void saveReturnsItsArgument() {
        when(bulletinRepository.save(any(BulletinPost.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ---------- create ----------

    @Test
    void createPost_withoutType_defaultsToAnnouncement() {
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);
        saveReturnsItsArgument();

        BulletinDto.Response response = bulletinService.createPost(request(null, null), AUTHOR_EMAIL).getData();

        assertEquals("ANNOUNCEMENT", response.getPostType());
        assertEquals("Sarah Jenkins", response.getAuthor().getFullName());
    }

    @Test
    void createPost_parsesEventDate() {
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);
        saveReturnsItsArgument();

        BulletinDto.Response response =
                bulletinService.createPost(request("event", "2026-10-05T14:30"), AUTHOR_EMAIL).getData();

        assertEquals("EVENT", response.getPostType());
        assertEquals(LocalDateTime.of(2026, 10, 5, 14, 30), LocalDateTime.parse(response.getEventDate()));
    }

    @Test
    void createPost_withUnknownType_isBadRequest() {
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);

        assertThrows(BadRequestException.class,
                () -> bulletinService.createPost(request("PARTY", null), AUTHOR_EMAIL));
        verify(bulletinRepository, never()).save(any());
    }

    @Test
    void createPost_withBadDate_isBadRequest() {
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);

        assertThrows(BadRequestException.class,
                () -> bulletinService.createPost(request("EVENT", "next Friday"), AUTHOR_EMAIL));
        verify(bulletinRepository, never()).save(any());
    }

    @Test
    void createPost_byUnverifiedUser_isForbidden() {
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);
        doThrow(new ForbiddenException("Your account must be verified before you can do this"))
                .when(userService).requireVerified(author);

        assertThrows(ForbiddenException.class,
                () -> bulletinService.createPost(request(null, null), AUTHOR_EMAIL));
        verify(bulletinRepository, never()).save(any());
    }

    // ---------- update / delete ----------

    @Test
    void updatePost_byAuthor_changesThePost() {
        BulletinPost post = existingPost();
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);
        when(bulletinRepository.findById(10L)).thenReturn(Optional.of(post));
        saveReturnsItsArgument();

        bulletinService.updatePost(10L, request("FUNDRAISER", null), AUTHOR_EMAIL);

        assertEquals("Textbook swap", post.getTitle());
        assertEquals("FUNDRAISER", post.getPostType());
    }

    @Test
    void updatePost_bySomeoneElse_isForbidden() {
        when(userService.getByEmail("vendor@shop.co.za")).thenReturn(stranger);
        when(bulletinRepository.findById(10L)).thenReturn(Optional.of(existingPost()));

        assertThrows(ForbiddenException.class,
                () -> bulletinService.updatePost(10L, request(null, null), "vendor@shop.co.za"));
        verify(bulletinRepository, never()).save(any());
    }

    @Test
    void updatePost_evenByAdmin_isForbidden() {
        when(userService.getByEmail("admin@communitystore.org")).thenReturn(admin);
        when(bulletinRepository.findById(10L)).thenReturn(Optional.of(existingPost()));

        assertThrows(ForbiddenException.class,
                () -> bulletinService.updatePost(10L, request(null, null), "admin@communitystore.org"));
    }

    @Test
    void deletePost_bySomeoneElse_isForbidden() {
        when(userService.getByEmail("vendor@shop.co.za")).thenReturn(stranger);
        when(bulletinRepository.findById(10L)).thenReturn(Optional.of(existingPost()));

        assertThrows(ForbiddenException.class, () -> bulletinService.deletePost(10L, "vendor@shop.co.za"));
        verify(bulletinRepository, never()).delete(any());
    }

    @Test
    void deletePost_byAdmin_isAllowed() {
        BulletinPost post = existingPost();
        when(userService.getByEmail("admin@communitystore.org")).thenReturn(admin);
        when(bulletinRepository.findById(10L)).thenReturn(Optional.of(post));

        bulletinService.deletePost(10L, "admin@communitystore.org");

        verify(bulletinRepository).delete(post);
    }

    @Test
    void deletePost_thatDoesNotExist_isNotFound() {
        when(userService.getByEmail(AUTHOR_EMAIL)).thenReturn(author);
        when(bulletinRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bulletinService.deletePost(404L, AUTHOR_EMAIL));
    }

    // ---------- read ----------

    @Test
    void getPosts_withType_filtersByThatType() {
        when(bulletinRepository.findByPostTypeOrderByCreatedAtDesc("EVENT")).thenReturn(List.of());

        bulletinService.getPosts("event");

        verify(bulletinRepository).findByPostTypeOrderByCreatedAtDesc("EVENT");
        verify(bulletinRepository, never()).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getPosts_withUnknownType_isBadRequest() {
        assertThrows(BadRequestException.class, () -> bulletinService.getPosts("PARTY"));
    }
}
