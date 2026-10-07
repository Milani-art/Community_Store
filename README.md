# Community-Store

> **PRM370/371/372S 2026 Group Project Implementation**  
> A mobile-first campus-community marketplace and hub connecting students, faculty, local vendors, and residents.

---

## Architecture Overview

- **Backend**: Java 17 + Spring Boot 3
  - **Database**: **MySQL** via **MySQL Workbench** (`community_store_db`)
  - **Security**: Spring Security with stateless JWT Authentication
  - **Database**: MySQL 8 (tables are created automatically and seed data is loaded on first start); H2 in-memory for automated tests
  - **API Documentation**: OpenAPI / Swagger UI at `/swagger-ui.html` & **Postman Collection**
- **Frontend**: React 18 + Vite
  - **Styling**: Modern CSS Design System (HSL colors, dark mode, glassmorphism, responsive cards)
  - **State Management**: React Context API (`AuthContext`, `CartContext`)
  - **API Client**: Axios with JWT Request Interceptor

---

## Repository Structure

Community-Store/
├── backend/
│   ├── pom.xml                                   # Spring Boot Maven configuration
│   └── src/main/java/com/communitystore/
│       ├── CommunityStoreApplication.java        # Application Main Entry
│       ├── config/                               # SecurityConfig, CorsConfig, SwaggerConfig, DataInitializer
│       ├── exception/                            # ApiException types + GlobalExceptionHandler (JSON errors)
│       ├── controller/                           # AuthController, ProductController, BulletinController, OrderController, UserController
│       ├── dto/                                  # AuthDtos, ProductDto, BulletinDto, OrderDto, ApiResponse
│       ├── model/                                # User, Role, Category, Product, BulletinPost, Order, OrderItem, Review
│       ├── repository/                           # Spring Data JPA Repositories
│       ├── security/                             # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl, UserDetailsImpl
│       └── service/                              # AuthService, UserService, ProductService, BulletinService, OrderService
└── frontend/
    ├── package.json                              # Vite & React dependencies
    ├── vite.config.js                            # Vite dev server & proxy settings
    ├── index.html                                # Main HTML shell with Google Fonts
    └── src/
        ├── App.jsx                               # Router & Context provider wrapper
        ├── main.jsx                               # React DOM root render
        ├── index.css                             # Custom campus marketplace theme & utilities
        ├── components/                           # Navbar, Footer, ProductCard, BulletinCard, CartDrawer, AuthModal
        ├── context/                              # AuthContext, CartContext
        ├── pages/                                # Home, Marketplace, ProductDetail, BulletinBoard, SellItem, Dashboard, AdminPanel
        └── services/                             # Axios API client module
```

> **Note**: Spring Boot automatically generates tables and pre-seeds initial sample users, products, and bulletin board posts on first startup via `DataInitializer.java`.

---

## 📬 Testing APIs with Postman

We have included a pre-configured **Postman Collection** file in the root folder:

📄 **`Community_Store_Postman_Collection.json`**

### How to use in Postman:
1. Open **Postman**.
2. Click **Import** (top-left button) -> Select [Community_Store_Postman_Collection.json](file:///C:/Users/HP/OneDrive/Desktop/Projects/Community-Store/Community_Store_Postman_Collection.json).
3. The collection provides pre-configured requests categorized into:
   - **1. Authentication**: Login (Student, Admin) & User Registration (automatically saves the JWT Bearer Token into collection variable).
   - **2. Marketplace Products**: Get All, Get By ID, Search, Category Filter, Create Listing.
   - **3. Bulletin Board**: Get All Posts, Create Announcement/Event.
   - **4. Orders & Checkout**: Create Order, View My Orders.
   - **5. Admin Operations**: Get Pending Verifications, Approve Verification.

---

## Getting Started

### 1. Prerequisites
- **Java 17 JDK** installed (`java -version`)
- **Maven** (or Maven wrapper)
- **MySQL 8** running locally on port 3306
- **Postman** (optional, for API testing)
- **Node.js v18+** and **npm** (`node -v`, `npm -v`)

---

### 2. Running the Spring Boot Backend

Navigate to the `backend/` folder:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080/api`**.

- **Swagger UI Interactive API Docs**: `http://localhost:8080/api/swagger-ui.html`
#### Database and configuration

The backend connects to MySQL and creates the `communitystore` database and its tables on first start.
Defaults are `root` with `password` as password on `localhost:3306`. Override them with environment variables
instead of editing `application.yml`, so passwords never get committed:

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/communitystore?...` | JDBC URL |
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | `password` | MySQL password |
| `JWT_SECRET` | development-only value | Token signing key, 32+ characters |
| `CORS_ALLOWED_ORIGINS` | any port on localhost | Frontend origins allowed to call the API |

```bash
# macOS / Linux
DB_PASSWORD=yourpassword mvn spring-boot:run

# Windows PowerShell
$env:DB_PASSWORD="yourpassword"; mvn spring-boot:run
```

#### Running the tests

```bash
mvn test
```

Tests use an in-memory H2 database (`src/test/resources/application-test.yml`), so MySQL does not need to be running.

#### Error format

Every error uses the same JSON shape as a success, with the matching HTTP status
(400 validation, 401 not signed in, 403 not allowed, 404 not found, 409 conflict):

```json
{ "success": false, "message": "Email is already registered", "data": null }
```

#### Seed Accounts Pre-loaded:
| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@campus.ac.za` | `password123` | Verified student account |
| **Vendor** | `vendor@campusbooks.co.za` | `password123` | Verified local business |
| **Faculty** | `professor@campus.ac.za` | `password123` | Department tutor |
| **Admin** | `admin@communitystore.org` | `admin123` | Admin & verification moderator |

---

### 3. Running the React Frontend

Navigate to the `frontend/` folder:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will launch at **`http://localhost:3000`**.
---

## Core Features & API Endpoints

### Auth & User Verification (`/api/auth`, `/api/users`)
- `POST /api/auth/register` - Register new account (Student uni email auto-verification; `ADMIN` cannot be self-registered)
- `POST /api/auth/login` - Authenticate & obtain JWT bearer token
- `GET /api/users/me` - View own profile, including verification status and rejection reason
- `PUT /api/users/me` - Update own name, institution/business and profile image
- `PUT /api/users/me/password` - Change own password
- `POST /api/users/me/request-verification` - Re-apply for verification after a rejection
- `GET /api/users` - Admin list of all users
- `GET /api/users/pending-verification` - Admin view pending user verifications
- `PUT /api/users/{id}/verify` - Admin approve user verification
- `PUT /api/users/{id}/reject` - Admin reject user verification (optional `{"reason": "..."}`)

### Campus Marketplace (`/api/products`)
- `GET /api/products` - List all active marketplace products & services
- `GET /api/products/{id}` - View detailed product listing
- `GET /api/products/category/{category}` - Filter by category (`TEXTBOOKS`, `ELECTRONICS`, `SERVICES`, `ECO_FRIENDLY`, etc.)
- `GET /api/products/search?q={query}` - Search listings by keyword
- `POST /api/products` - Publish new listing (Requires Authentication)

### Community Bulletin Board (`/api/bulletin`)
- `GET /api/bulletin` - List posts, newest first; optional `?type=ANNOUNCEMENT|EVENT|SERVICE_OFFER|FUNDRAISER`
- `GET /api/bulletin/{id}` - View one post
- `GET /api/bulletin/mine` - List own posts (Requires Authentication)
- `POST /api/bulletin` - Publish new post (Requires a verified account)
- `PUT /api/bulletin/{id}` - Edit a post (author only)
- `DELETE /api/bulletin/{id}` - Delete a post (author or admin)

### Checkout & Cart Orders (`/api/orders`)
- `POST /api/orders` - Complete checkout with SnapScan / PayFast / Cash payment method
- `GET /api/orders/my-orders` - View user purchase history
