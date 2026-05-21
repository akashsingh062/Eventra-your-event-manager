# 🎓 Eventra – Campus Event Management System

<div align="center">

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=for-the-badge&logo=render&logoColor=white)](https://eventra-your-event-manager.onrender.com/)
  [![GitHub License](https://img.shields.io/github/license/akashsingh062/Eventra-your-event-manager?style=for-the-badge)](https://github.com/akashsingh062/Eventra-your-event-manager/blob/main/LICENSE)
  [![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

  **Eventra** is a professional, full‑stack MERN application designed to manage, register, and ticket campus events. Featuring role‑based student and admin dashboards, Razorpay payments, QR‑code ticketing, and live camera‑based checking verification, it delivers a production-grade campus event lifecycle.

  ### [🔗 Visit Live Website](https://eventra-your-event-manager.onrender.com/)
</div>

---

## 🌟 Key Features

### 👨‍🎓 Student Features
*   **Explore Campus Events**: Discover free and paid events on a clean, responsive layout.
*   **Event Registrations**: Register for free events or purchase paid events using integrated checkout.
*   **Razorpay Integration**: Real-time payments processing with INR currency support.
*   **Simulated Sandbox Checkout**: Built-in test payment modal for testing checkout flow in non-production environments when API keys aren't set.
*   **QR-Code Tickets**: Instant generation of secure QR tickets containing registration tokens, available for download as offline PNG cards.
*   **Seat Trackers**: Real-time visual meters showing remaining available seats per event.

### 🧑‍💼 Admin Features
*   **Event Management**: Full CRUD capabilities to create, edit, or delete events.
*   **Rich Analytics Dashboard**: View total revenue, registrations, active/upcoming events, and student growth stats.
*   **Cloudinary Uploads**: Easily drag-and-drop or select banner files for event listings.
*   **Registration Auditing**: Direct list view of all tickets, with the ability to delete registrations and restore seat capacities.
*   **QR Check-In Scanner**: Live webcam/camera reader to scan and verify student tickets at the venue. Includes HTML5 manual lookup fallback and sound effects feedback on verification.
*   **Optimized Performance**: Mongoose indexes on frequently searched parameters (`razorpayOrderId`, `createdBy`, `date`, and `status`).

---

## 🏗️ Tech Stack

| Frontend | Backend | Database & Cloud |
| :--- | :--- | :--- |
| **React 18** (Vite build system) | **Node.js** & **Express.js** | **MongoDB Atlas** (NoSQL Database) |
| **Tailwind CSS** (Custom Styling) | **JWT (JSON Web Tokens)** | **Mongoose** (ODM / Indexing) |
| **React Router DOM v6** (Routing) | **Multer** & **Cloudinary SDK** | **Cloudinary** (Asset Storage) |
| **qrcode.react** (Synchronous Canvas QR) | **Razorpay Webhooks & SDK** | **Render** (Production Deployment) |
| **React-Toastify** (Toast Alerts) | **Bcryptjs** (Password Hashing) | |

---

## 📂 File Architecture

### Frontend
```
frontend/src/
 ├── components/
 │   ├── admin/         # Admin Sidebar and Widgets
 │   ├── student/       # Event Cards, QRTicket component
 │   └── common/        # Navbar, Footer, Theme toggle, Route protection
 ├── pages/
 │   ├── admin/         # Dashboard, ManageEvents, Registrations, CheckIn scanner
 │   ├── auth/          # Login & Register views
 │   └── student/       # Home feed, Events explorer, MyRegistrations
 ├── context/           # AuthContext & EventContext (Global states)
 └── services/          # API Axios configuration
```

### Backend
```
backend/
 ├── config/            # MongoDB, Cloudinary, and Razorpay initializers
 ├── controllers/       # Auth, Event, Registration, and Payment controllers
 ├── middleware/        # JWT Authentication and error-handling middlewares
 ├── models/            # Event, Registration, and User Mongoose schemas
 └── server.js          # Express entry point
```

---

## 🔐 Security Hardening & Optimizations

*   **Database Indexing**: Unique and sparse index on `razorpayOrderId` prevents order duplication. Indexing on `createdBy`, `date`, and `status` optimizes dashboard queries.
*   **Input Sanitization**: Password length boundaries (minimum 6 characters) and email pattern validation added during signup before password hashing.
*   **Proportional Seat Adjustment**: Delta calculations ensure that changing `totalSeats` updates `availableSeats` proportionally without corrupting capacity limits.
*   **Production Environment Safeguards**: Payment simulation mode is blocked in production. Mock bypasses throw errors if `NODE_ENV === "production"`.
*   **Efficient Rendering**: Switched from vector `QRCodeSVG` to `QRCodeCanvas` for ticket generation, preventing browser extensions from blocking QR code rendering and making ticket downloads synchronous and instant.

---

## ⚙️ Local Development Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/akashsingh062/Eventra-your-event-manager.git
cd Eventra-your-event-manager
```

### 2️⃣ Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_phrase
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Real Razorpay Keys (If left empty, system enters Simulator Mode in dev)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
Start the backend server:
```bash
npm run dev
```

### 3️⃣ Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
Start the frontend development server:
```bash
npm run dev
```
Open `http://localhost:5173` to view the application.

---

## 👨‍💻 Author

**Akash Singh**
*   GitHub: [@akashsingh062](https://github.com/akashsingh062)
*   Role: Full‑Stack Developer

---
⭐ If you find this project useful, please consider giving it a star on GitHub!