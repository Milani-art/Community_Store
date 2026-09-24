# Community-Store

> **PRM370/371/372S 2026 Group Project Implementation**  
> A mobile-first campus-community marketplace and hub connecting students, faculty, local vendors, and residents.

---

## 🌟 Architecture Overview

- **Backend**: Java 17 + Spring Boot 3
  - **Database**: **MySQL** via **MySQL Workbench** (`community_store_db`)
  - **Security**: Spring Security with stateless JWT Authentication
  - **API Documentation**: OpenAPI / Swagger UI at `/swagger-ui.html` & **Postman Collection**
- **Frontend**: React 18 + Vite
  - **Styling**: Modern CSS Design System (HSL colors, dark mode, glassmorphism, responsive cards)
  - **State Management**: React Context API (`AuthContext`, `CartContext`)
  - **API Client**: Axios with JWT Request Interceptor

---

## 🗄️ Database Setup (MySQL & MySQL Workbench)

### 1. Create MySQL Database

Open **MySQL Workbench** and connect to your local MySQL instance (port `3306`).

Execute the provided [database_setup.sql](file:///C:/Users/HP/OneDrive/Desktop/Projects/Community-Store/database_setup.sql) script or run the following query:

```sql
CREATE DATABASE IF NOT EXISTS `community_store_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 2. Spring Boot MySQL Configuration

The backend is configured in [application.yml](file:///C:/Users/HP/OneDrive/Desktop/Projects/Community-Store/backend/src/main/resources/application.yml) with the following connection settings:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/community_store_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: password # Update to match your MySQL Workbench root password
  jpa:
    database-platform: org.hibernate.dialect.MySQLDialect
    hibernate:
      ddl-auto: update
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

## 🚀 Getting Started

### 1. Prerequisites
- **Java 17 JDK** installed (`java -version`)
- **MySQL Server & MySQL Workbench** running on port `3306`
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
