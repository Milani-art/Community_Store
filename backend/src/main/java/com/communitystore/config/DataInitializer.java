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

        // Ensure seed users exist
        if (userRepository.count() == 0) {
            userRepository.saveAll(Arrays.asList(student, vendor, faculty, resident, admin));
        } else {
            student = userRepository.findByEmail("student@mycput.ac.za").orElse(student);
            vendor = userRepository.findByEmail("vendor@campusbooks.co.za").orElse(vendor);
            faculty = userRepository.findByEmail("professor@cput.ac.za").orElse(faculty);
            resident = userRepository.findByEmail("resident@community.org").orElse(resident);
            admin = userRepository.findByEmail("admin@communitystore.org").orElse(admin);
        }

        // Create Seed Products if they haven't been added yet
        boolean hasNewMockData = productRepository.findAll().stream()
                .anyMatch(p -> p.getTitle().equals("Student Room near District Six"));

        if (!hasNewMockData) {
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

            Product p5 = Product.builder()
                    .title("Student Room near District Six")
                    .description("Looking for a flatmate to share a 2-bedroom apartment. 5 mins walk from campus. Wi-Fi included.")
                    .price(new BigDecimal("3500.00"))
                    .category(Category.HOUSING)
                    .conditionName("Rental")
                    .isEcoFriendly(false)
                    .isAvailable(true)
                    .location("Zonnebloem, Cape Town")
                    .seller(resident)
                    .imageUrl("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p6 = Product.builder()
                    .title("CPUT Alumni Hoodie (Size M)")
                    .description("Official CPUT apparel. Worn only a few times. Very warm and comfortable.")
                    .price(new BigDecimal("250.00"))
                    .category(Category.CLOTHING)
                    .conditionName("Used - Excellent")
                    .isEcoFriendly(false)
                    .isAvailable(true)
                    .location("Bellville Campus")
                    .seller(student)
                    .imageUrl("https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p7 = Product.builder()
                    .title("Scientific Calculator CASIO FX-991EX")
                    .description("Advanced scientific calculator perfect for engineering students.")
                    .price(new BigDecimal("400.00"))
                    .category(Category.OTHER)
                    .conditionName("Used - Good")
                    .isEcoFriendly(false)
                    .isAvailable(true)
                    .location("District Six Campus")
                    .seller(faculty)
                    .imageUrl("https://images.unsplash.com/photo-1611078712745-f09dfd445524?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p8 = Product.builder()
                    .title("Intro to Sociology Textbook")
                    .description("Required text for SOC101. Excellent condition.")
                    .price(new BigDecimal("280.00"))
                    .category(Category.TEXTBOOKS)
                    .conditionName("Used - Like New")
                    .isEcoFriendly(true)
                    .isAvailable(true)
                    .location("Mowbray Campus")
                    .seller(student)
                    .imageUrl("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p9 = Product.builder()
                    .title("Graphic Design Portfolio Review")
                    .description("Get professional feedback on your design portfolio. 1 hour session.")
                    .price(new BigDecimal("200.00"))
                    .category(Category.SERVICES)
                    .conditionName("Service")
                    .isEcoFriendly(true)
                    .isAvailable(true)
                    .location("Online")
                    .seller(vendor)
                    .imageUrl("https://images.unsplash.com/photo-1512295767273-ac109cb3466f?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p10 = Product.builder()
                    .title("Reusable Bamboo Coffee Cup")
                    .description("Reduce waste with this stylish and durable bamboo cup. Includes silicone lid.")
                    .price(new BigDecimal("120.00"))
                    .category(Category.ECO_FRIENDLY)
                    .conditionName("New")
                    .isEcoFriendly(true)
                    .isAvailable(true)
                    .location("Bellville Campus Student Center")
                    .seller(vendor)
                    .imageUrl("https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p11 = Product.builder()
                    .title("Noise Cancelling Headphones")
                    .description("Sony WH-1000XM4. Great for studying in loud environments. Comes with case.")
                    .price(new BigDecimal("3500.00"))
                    .category(Category.ELECTRONICS)
                    .conditionName("Used - Good")
                    .isEcoFriendly(false)
                    .isAvailable(true)
                    .location("District Six Campus")
                    .seller(resident)
                    .imageUrl("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p12 = Product.builder()
                    .title("Vintage Denim Jacket")
                    .description("Classic style, fits size L. Great condition.")
                    .price(new BigDecimal("350.00"))
                    .category(Category.CLOTHING)
                    .conditionName("Used - Good")
                    .isEcoFriendly(true)
                    .isAvailable(true)
                    .location("Observatory")
                    .seller(student)
                    .imageUrl("https://images.unsplash.com/photo-1495105787522-5334e3ffa0eb?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p13 = Product.builder()
                    .title("Studio Apartment near Bellville Campus")
                    .description("Cozy studio suitable for a single student. Safe building with parking.")
                    .price(new BigDecimal("4500.00"))
                    .category(Category.HOUSING)
                    .conditionName("Rental")
                    .isEcoFriendly(false)
                    .isAvailable(true)
                    .location("Bellville")
                    .seller(resident)
                    .imageUrl("https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80")
                    .build();

            Product p14 = Product.builder()
                    .title("Bicycle - Commuter")
                    .description("Save on transport and stay fit! Includes helmet and lock.")
                    .price(new BigDecimal("1200.00"))
                    .category(Category.OTHER)
                    .conditionName("Used - Fair")
                    .isEcoFriendly(true)
                    .isAvailable(true)
                    .location("Cape Town CBD")
                    .seller(student)
                    .imageUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80")
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14));
        }

        // Create Seed Bulletin Posts if they haven't been added yet
        boolean hasNewBulletinData = bulletinRepository.findAll().stream()
                .anyMatch(b -> b.getTitle().equals("Campus Charity Fun Run"));

        if (!hasNewBulletinData) {
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

            BulletinPost post3 = BulletinPost.builder()
                    .title("Campus Charity Fun Run")
                    .content("We are raising funds for the new student food bank! Register for the 5km run this weekend. All proceeds go to charity.")
                    .postType("FUNDRAISER")
                    .tags("Charity,Running,Community")
                    .eventDate(LocalDateTime.now().plusDays(5))
                    .author(resident)
                    .build();

            BulletinPost post4 = BulletinPost.builder()
                    .title("Free Web Design Workshop")
                    .content("Offering a free 2-hour crash course in React and Tailwind CSS for beginners. Bring your laptops!")
                    .postType("SERVICE_OFFER")
                    .tags("Workshop,WebDesign,Free")
                    .eventDate(LocalDateTime.now().plusDays(2))
                    .author(faculty)
                    .build();

            BulletinPost post5 = BulletinPost.builder()
                    .title("Lost Keys near Library")
                    .content("Has anyone seen a set of keys with a blue lanyard near the main library? Please let me know!")
                    .postType("ANNOUNCEMENT")
                    .tags("LostAndFound")
                    .author(student)
                    .build();

            bulletinRepository.saveAll(Arrays.asList(post1, post2, post3, post4, post5));
        }
    }
}
