

# 🎓 Eventra – Campus Event Management System

Eventra is a **full‑stack MERN application** built to manage campus events efficiently.  
It provides **role‑based access** for **Students** and **Admins**, enabling smooth event discovery, registrations, and complete administrative control.

This project is designed with **real‑world application architecture** and focuses on **security, scalability, and clean UI/UX**.

---

## 🌐 Live Demo

🔗 **Project Link:**  
https://eventra-your-event-manager.onrender.com

## 🚀 Features

### 👨‍🎓 Student
- View all available campus events
- Register for events
- View registered events
- Seat availability tracking
- Secure authentication

### 🧑‍💼 Admin
- Admin dashboard with analytics
- Create, update, and delete events
- Upload event banners (Cloudinary)
- View all event registrations
- Delete registrations (auto seat restore)
- Role‑based admin sidebar
- Secure admin‑only routes

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Context API
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (file uploads)
- Cloudinary (image hosting)

---

## 🔐 Authentication & Authorization

- JWT‑based authentication
- Role‑based access control:
  - `student`
  - `admin`
- Protected frontend routes
- Protected backend routes using middleware

---

## 📁 Project Structure

### Frontend
```
src/
 ├── components/
 │   ├── admin/
 │   ├── student/
 │   └── common/
 ├── pages/
 │   ├── admin/
 │   ├── auth/
 │   └── student/
 ├── context/
 ├── routes/
 ├── services/
 └── assets/
```

### Backend
```
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── config/
 └── server.js
```

---

## 🛠️ API Routes Overview

### Public / Student
```
GET    /api/events
POST   /api/registrations/:eventId
GET    /api/registrations/my
```

### Admin
```
GET    /api/admin/dashboard

GET    /api/admin/events/:id
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id
GET    /api/admin/events/:id/registrations

GET    /api/admin/registrations
DELETE /api/admin/registrations/:id
```

All admin routes are protected using:
```
authMiddleware + roleMiddleware("admin")
```

---

## 📊 Admin Dashboard

The admin dashboard displays:
- Total events
- Total registrations
- Total students
- Upcoming events
- Completed events

All statistics are aggregated securely on the backend.

---

## 🖼️ Image Uploads

- Event banners uploaded using **Multer**
- Stored on **Cloudinary**
- Automatically linked to events

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/eventra.git
cd eventra
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
npm run dev
```

Create `.env` file:
```env
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Key Learnings

- Role‑based application architecture
- Secure route protection
- Context‑based state management
- Reusable admin UI components
- Real‑world CRUD workflows
- File upload handling in MERN stack

---

## 📌 Future Improvements
- Event search & filters
- Pagination & sorting
- Attendance tracking
- CSV export for registrations
- Admin analytics charts
- Notification system

---

## 👨‍💻 Author
**Akash Singh**  
Student | Full‑Stack Developer  

Built as a real‑world MERN project for learning and portfolio use.

---

⭐ If you like this project, consider giving it a star on GitHub!