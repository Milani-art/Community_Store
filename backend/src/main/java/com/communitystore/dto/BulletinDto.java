package com.communitystore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class BulletinDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be at most 255 characters")
        private String title;

        @NotBlank(message = "Content is required")
        @Size(max = 3000, message = "Content must be at most 3000 characters")
        private String content;

        private String postType; // ANNOUNCEMENT, EVENT, SERVICE_OFFER, FUNDRAISER

        @Size(max = 255, message = "Tags must be at most 255 characters")
        private String tags;

        private String eventDate;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private String postType;
        private String tags;
        private AuthDtos.UserSummaryDto author;
        private String eventDate;
        private String createdAt;
    }
}
