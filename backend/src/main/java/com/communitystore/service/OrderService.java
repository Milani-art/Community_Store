package com.communitystore.service;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.dto.OrderDto;
import com.communitystore.model.Order;
import com.communitystore.model.OrderItem;
import com.communitystore.model.Product;
import com.communitystore.model.User;
import com.communitystore.repository.OrderRepository;
import com.communitystore.repository.ProductRepository;
import com.communitystore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final UserRepository userRepository;
        private final ProductService productService;
        private final AuthService authService;

        public ApiResponse<OrderDto.Response> createOrder(OrderDto.CreateRequest request, String userEmail) {
                String paymentMethod = request.getPaymentMethod() != null
                                ? request.getPaymentMethod().toUpperCase()
                                : "SNAPSCAN";

                Order savedOrder = createAndSaveOrder(request, userEmail, paymentMethod, "COMPLETED");
                return ApiResponse.success("Order created successfully", mapToResponse(savedOrder));
        }

        private Order createAndSaveOrder(
                        OrderDto.CreateRequest request,
                        String userEmail,
                        String paymentMethod,
                        String status) {
                User buyer = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("Buyer user not found"));

                if (buyer.getRole() == com.communitystore.model.Role.ADMIN) {
                        throw new com.communitystore.exception.ForbiddenException("Admins cannot purchase products.");
                }

                Order order = Order.builder()
                                .buyer(buyer)
                                .status(status)
                                .paymentMethod(paymentMethod)
                                .items(new ArrayList<>())
                                .build();

                BigDecimal total = BigDecimal.ZERO;

                for (OrderDto.ItemRequest itemReq : request.getItems()) {
                        Product product = productRepository.findById(itemReq.getProductId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Product not found with id: " + itemReq.getProductId()));

                        BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                        total = total.add(itemTotal);

                        OrderItem orderItem = OrderItem.builder()
                                        .order(order)
                                        .product(product)
                                        .quantity(itemReq.getQuantity())
                                        .price(product.getPrice())
                                        .build();

                        order.getItems().add(orderItem);
                }

                order.setTotalAmount(total);
                return orderRepository.save(order);
        }

        public ApiResponse<List<OrderDto.Response>> getUserOrders(String userEmail) {
                User buyer = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());
                List<OrderDto.Response> dtos = orders.stream().map(this::mapToResponse).collect(Collectors.toList());
                return ApiResponse.success("User order history retrieved", dtos);
        }

        private OrderDto.Response mapToResponse(Order order) {
                AuthDtos.UserSummaryDto buyerDto = authService.mapToSummary(order.getBuyer());

                List<OrderDto.ItemResponse> itemResponses = order.getItems().stream()
                                .map(item -> OrderDto.ItemResponse.builder()
                                                .id(item.getId())
                                                .product(productService.mapToResponse(item.getProduct()))
                                                .quantity(item.getQuantity())
                                                .price(item.getPrice())
                                                .build())
                                .collect(Collectors.toList());

                return OrderDto.Response.builder()
                                .id(order.getId())
                                .buyer(buyerDto)
                                .totalAmount(order.getTotalAmount())
                                .status(order.getStatus())
                                .paymentMethod(order.getPaymentMethod())
                                .items(itemResponses)
                                .createdAt(order.getCreatedAt() != null
                                                ? order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                                : "")
                                .build();
        }
}
