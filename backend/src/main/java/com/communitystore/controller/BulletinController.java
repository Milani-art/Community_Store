package com.communitystore.controller;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.BulletinDto;
import com.communitystore.service.BulletinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Who may call what is decided in SecurityConfig: GETs are public (except /mine),
 * everything else needs a valid token. Ownership rules live in BulletinService.
 */
@RestController
@RequestMapping("/bulletin")
@RequiredArgsConstructor
public class BulletinController {

    private final BulletinService bulletinService;

    /** GET /bulletin or GET /bulletin?type=EVENT */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BulletinDto.Response>>> getPosts(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(bulletinService.getPosts(type));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<BulletinDto.Response>>> getMyPosts(Authentication authentication) {
        return ResponseEntity.ok(bulletinService.getMyPosts(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BulletinDto.Response>> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(bulletinService.getPostById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BulletinDto.Response>> createPost(
            @Valid @RequestBody BulletinDto.CreateRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bulletinService.createPost(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BulletinDto.Response>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody BulletinDto.CreateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(bulletinService.updatePost(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bulletinService.deletePost(id, authentication.getName()));
    }
}
