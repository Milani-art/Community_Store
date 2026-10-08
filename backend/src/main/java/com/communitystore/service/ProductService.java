package com.communitystore.service;

import com.communitystore.dto.ApiResponse;
import com.communitystore.dto.AuthDtos;
import com.communitystore.dto.ProductDto;
import com.communitystore.model.Category;
import com.communitystore.model.Product;
import com.communitystore.model.User;
import com.communitystore.repository.ProductRepository;
import com.communitystore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public ApiResponse<List<ProductDto.Response>> getAllProducts() {
        List<Product> products = productRepository.findByIsAvailableTrueOrderByCreatedAtDesc();
        List<ProductDto.Response> dtos = products.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success("Products retrieved successfully", dtos);
    }

    public ApiResponse<ProductDto.Response> getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ApiResponse.success("Product found", mapToResponse(product));
    }

    public ApiResponse<List<ProductDto.Response>> getProductsByCategory(Category category) {
        List<Product> products = productRepository.findByCategoryAndIsAvailableTrue(category);
        List<ProductDto.Response> dtos = products.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success("Products retrieved by category", dtos);
    }

    public ApiResponse<List<ProductDto.Response>> searchProducts(String query) {
        List<Product> products = productRepository.searchProducts(query);
        List<ProductDto.Response> dtos = products.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ApiResponse.success("Search results retrieved", dtos);
    }

    public ApiResponse<ProductDto.Response> createProduct(ProductDto.CreateRequest request, String userEmail) {
        User seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Seller user not found"));

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .conditionName(request.getConditionName() != null ? request.getConditionName() : "Good")
                .isEcoFriendly(request.isEcoFriendly())
                .isAvailable(true)
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isEmpty() 
                        ? request.getImageUrl() 
                        : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80")
                .location(request.getLocation() != null ? request.getLocation() : "Campus Main")
                .seller(seller)
                .build();

        Product savedProduct = productRepository.save(product);
        return ApiResponse.success("Product created successfully", mapToResponse(savedProduct));
    }

    public ApiResponse<Void> deleteProduct(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (user.getRole() != com.communitystore.model.Role.ADMIN && !product.getSeller().getId().equals(user.getId())) {
            throw new com.communitystore.exception.ForbiddenException("Only the seller or an admin can delete this product.");
        }

        productRepository.delete(product);
        return ApiResponse.success("Product deleted successfully", null);
    }

    public ProductDto.Response mapToResponse(Product product) {
        AuthDtos.UserSummaryDto sellerDto = authService.mapToSummary(product.getSeller());
        return ProductDto.Response.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .conditionName(product.getConditionName())
                .ecoFriendly(product.isEcoFriendly())
                .available(product.isAvailable())
                .imageUrl(product.getImageUrl())
                .location(product.getLocation())
                .seller(sellerDto)
                .createdAt(product.getCreatedAt() != null ? product.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "")
                .build();
    }
}
