package com.communitystore.controller;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.OrderDto;
import com.communitystore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDto.Response>> createOrder(
            @Valid @RequestBody OrderDto.CreateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.createOrder(request, authentication.getName()));
    }


    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderDto.Response>>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }
}
