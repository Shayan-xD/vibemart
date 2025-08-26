# Vibemart - Your Smart E-Commerce Solution

Vibemart is a modern and responsive e-commerce platform built with a powerful **Spring Boot backend** and a sleek **React + Tailwind CSS frontend**.  
It provides an engaging shopping experience for buyers while offering sellers and admins a robust dashboard with analytics and full control over orders and products.  

## 🚀 Features

### 👤 User (Buyer)
- Register and log in using JWT authentication.
- Browse products in guest mode (cannot add to cart or review without login).
- Add products to cart and checkout using **Stripe payments** (requires your own Stripe keys).
- Submit product reviews after login.
- View order history and order details.
- Receive **real-time notifications** for:
  - Adding to cart
  - Order placed
  - Order status updates

### 🛠️ Admin (Super Admin)
- Login with default credentials:
  - **Email**: `admin@gmail.com`
  - **Password**: `admin`
- Interactive dashboard with analytics:
  - Total products
  - Total sellers
  - Delivered vs Pending orders
  - Site revenue + Revenue breakdown by seller
- Full CRUD operations on:
  - Sellers
  - Products
- Manage and filter orders:
  - By status
  - By customer email
- Update order statuses:
  - `Confirmed (Initial)` → `Processing` → `Shipped` → `Delivered`
- Trigger notifications for buyers on order updates.

### 📦 Sellers
- Sellers can be managed by the admin.
- Revenue tracking per seller is available in the dashboard.

---

## 🖥️ Frontend

- Built with **React** and **Tailwind CSS**.
- State management with **Redux Toolkit**.
- Responsive UI with smooth animations.
- Real-time notifications system integrated.
- Stripe payment integration (test mode requires your own keys).
- Modern, user-friendly design.

---

## ⚙️ Backend

- **Spring Boot 3.3.13** with **Java 21** (tested on OpenJDK 23).
- Follows clean architecture:
  - Controllers
  - Services → ServiceImpl
  - Repositories
  - DTOs
  - Mappers
  - Models
- Uses **JWT authentication** for secure user sessions.
- Integrated with **Stripe** (secret key required).
- Database: **MySQL** (database name: `vibemart`).
- Models include:
  - Product
  - User
  - Seller
  - Order
  - Order Items
  - Reviews
  - Notifications
  - PaymentInfo
  - Shipping Address

---

## 🔑 Authentication & Authorization

- JWT-based authentication for all users.
- Buyer and Admin roles defined with separate privileges.
- Guest users have limited access (view-only).

---

## 📊 Order Management Lifecycle

- Orders progress through the following states:
  1. Confirmed (Initial)
  2. Processing
  3. Shipped
  4. Delivered

- Cancelled and Paid orders cannot be modified further.
- Notifications are sent to buyers at each stage.

---

## 🛠️ Tech Stack

**Frontend**
- React
- Tailwind CSS
- Redux Toolkit
- Stripe Integration

**Backend**
- Java 21 (OpenJDK 23 compatible)
- Spring Boot 3.3.13
- MySQL
- JWT Authentication
- Stripe SDK

---

## ⚡ Installation & Setup

### Prerequisites
- Node.js & npm
- MySQL
- Java 21 or OpenJDK 23
- Maven
- Stripe Account (for payment integration)

### Frontend Setup
```bash
cd frontend
npm install
npm start
