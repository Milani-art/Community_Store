package com.communitystore.config;

import com.communitystore.model.*;
import com.communitystore.repository.BulletinRepository;
import com.communitystore.repository.ProductRepository;
import com.communitystore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final BulletinRepository bulletinRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // Create Seed Users
        User student = User.builder()
                .email("student@mycput.ac.za")
                .password(passwordEncoder.encode("password123"))
                .fullName("Sarah Jenkins")
                .role(Role.STUDENT)
                .institutionOrBusiness("Faculty of IT & Engineering")
                .verified(true)
                .rating(4.8)
                .totalRatings(12)
                .build();

        User vendor = User.builder()
                .email("vendor@campusbooks.co.za")
                .password(passwordEncoder.encode("password123"))
                .fullName("Campus Supplies Co.")
                .role(Role.VENDOR)
                .institutionOrBusiness("Reg No: 2024/88921/07")
                .verified(true)
                .rating(4.9)
                .totalRatings(45)
                .build();

        User faculty = User.builder()
                .email("professor@cput.ac.za")
                .password(passwordEncoder.encode("password123"))
                .fullName("Dr. Michael Vance")
                .role(Role.FACULTY)
                .institutionOrBusiness("Department of Computer Science")
                .verified(true)
                .rating(5.0)
                .totalRatings(8)
                .build();

        User resident = User.builder()
                .email("resident@community.org")
                .password(passwordEncoder.encode("password123"))
                .fullName("David Miller")
                .role(Role.RESIDENT)
                .institutionOrBusiness("Suburbs Community Watch")
                .verified(false)
                .rating(4.5)
                .totalRatings(3)
                .build();

        User admin = User.builder()
                .email("admin@communitystore.org")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(Role.ADMIN)
                .institutionOrBusiness("Platform Operations")
                .verified(true)
                .rating(5.0)
                .totalRatings(100)
                .build();

        userRepository.saveAll(Arrays.asList(student, vendor, faculty, resident, admin));

        // Create Seed Products
        Product p1 = Product.builder()
                .title("Project Management 3rd Edition Textbook")
                .description("Clean condition, minimal highlighting. Essential for PRM370 module.")
                .price(new BigDecimal("350.00"))
                .category(Category.TEXTBOOKS)
                .conditionName("Used - Good")
                .isEcoFriendly(true)
                .isAvailable(true)
                .location("District Six Campus - Library")
                .seller(student)
                .imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80")
                .build();

        Product p2 = Product.builder()
                .title("Dell XPS 13 i7 16GB RAM")
                .description("Lightly used laptop for coding and graphics design. Includes charger and protective sleeve.")
                .price(new BigDecimal("8500.00"))
                .category(Category.ELECTRONICS)
                .conditionName("Used - Excellent")
                .isEcoFriendly(false)
                .isAvailable(true)
                .location("Bellville Campus - Student Res B")
                .seller(student)
                .imageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80")
                .build();

        Product p3 = Product.builder()
                .title("Eco Bamboo Desk Organizer & Lamp")
                .description("Sustainably harvested bamboo organizer with touch LED dimmable desk light.")
                .price(new BigDecimal("220.00"))
                .category(Category.ECO_FRIENDLY)
                .conditionName("New")
                .isEcoFriendly(true)
                .isAvailable(true)
                .location("District Six Campus - Piazza")
                .seller(vendor)
                .imageUrl("https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80")
                .build();

        Product p4 = Product.builder()
                .title("Java & Spring Boot Tutoring (Per Hour)")
                .description("One-on-one assistance for object-oriented programming, data structures, and REST API development.")
                .price(new BigDecimal("150.00"))
                .category(Category.SERVICES)
                .conditionName("Service")
                .isEcoFriendly(true)
                .isAvailable(true)
                .location("Online / Bellville Campus IT Centre")
                .seller(faculty)
                .imageUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80")
                .build();

        productRepository.saveAll(Arrays.asList(p1, p2, p3, p4));

        // Create Seed Bulletin Posts
        BulletinPost post1 = BulletinPost.builder()
                .title("Eco-Drive: CPUT E-Waste & Textbook Recycle Fair")
                .content("Join us this Friday at the Student Center Quad! Trade old textbooks, recycle electronic waste safely, and earn Community Loyalty Badges.")
                .postType("EVENT")
                .tags("Sustainability,Recycling,CPUT")
                .eventDate(LocalDateTime.now().plusDays(3))
                .author(student)
                .build();

        BulletinPost post2 = BulletinPost.builder()
                .title("Local Vendor Student Discount Week!")
                .content("All verified CPUT email holders get 15% discount on stationery and printing services at Campus Supplies Co. this month!")
                .postType("ANNOUNCEMENT")
                .tags("Discounts,Stationery,VendorOffer")
                .author(vendor)
                .build();

        bulletinRepository.saveAll(Arrays.asList(post1, post2));
    }
}
