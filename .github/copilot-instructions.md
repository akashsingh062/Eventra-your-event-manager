# Copilot Instructions for Eventra

## Project Overview
Eventra is a full-stack MERN campus event management system with role-based access control (Students/Admins). It manages event discovery, registrations, and seat availability.

## Architecture & Data Flow

### Backend Structure
- **Entry Point**: `backend/server.js` - Express setup, middleware, routes initialization
- **Models** (`backend/models/`): User (role-based), Event, Registration
  - Registration schema has unique index on `{user, event}` to prevent duplicate registrations
  - Event tracks `totalSeats` and `availableSeats` (decremented on registration)
- **Controllers** (`backend/controllers/`): authController, eventController, registrationController
- **Middleware**:
  - `authMiddleware.js`: JWT verification, extracts user from token
  - `roleMiddleware.js`: Factory function that checks `req.user.role` against required role
  - `errorMiddleware.js`: Catch-all error handler
- **Utils**: `asyncHandler.js` (wraps async route handlers to catch errors), `generateToken.js` (JWT creation)

### Frontend Structure
- **Routing** (`src/routes/AppRoutes.jsx`): Public routes (Home, Login, Register, Events) + role-protected admin routes
- **Context** (`src/context/`): AuthContext manages user state, token persistence, login/logout
- **Services** (`src/services/`):
  - `api.js`: Axios instance with auto-injected Bearer token from localStorage
  - `authService.js`, `eventService.js`: API wrappers
- **Components**: Organized by role (admin/, student/) + common/ (Navbar, Footer, ProtectedRoute)

### Auth Flow
1. User registers/logs in → backend returns `{ token, _id, name, email, role }`
2. Token stored in localStorage, injected via axios interceptor in all requests
3. ProtectedRoute checks `isAuthenticated && user?.role` to gate access
4. Backend authMiddleware verifies token, attaches `req.user` for subsequent middleware

## Key Development Patterns

### Error Handling
- Backend: Use `asyncHandler` utility to wrap async route handlers; throw errors with `res.status(code); throw new Error(msg)`
- Frontend: Catch errors and display via `react-toastify` (toast.error/success)

### Database Operations
- Mongoose models use `.models.Model || mongoose.model()` pattern to avoid re-registration during hot reloads
- Registration creation must check `availableSeats > 0` and decrement both event's availableSeats and increment when deleting
- Use `.populate()` for relational queries (e.g., populate User/Event details in registrations)

### API Response Format
- Success: JSON object with data fields (no wrapper object required)
- Error: Status code + `{ message: "..." }` object

## Critical Workflows

### Running Development
```bash
# Backend
cd backend && npm install && npm run dev  # Runs on PORT (default 4000)

# Frontend  
cd frontend && npm install && npm run dev # Vite dev server (typically :5173)
```

### Environment Variables
**Backend** (`.env`):
- `PORT=4000`
- `MONGO_URI=<mongodb_connection>`
- `JWT_SECRET=<secret_key>`
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (for banner uploads)

**Frontend** (`.env.local`):
- `VITE_API_URL=http://localhost:4000` (defaults to this if not set)

### Common Tasks
- **Add new admin route**: Create endpoint in `backend/routes/adminRoutes.js` → wrap with `authMiddleware` + `roleMiddleware("admin")`
- **Create student feature**: Add page in `frontend/src/pages/student/` → wrap route in `<ProtectedRoute role="student">`
- **Handle registration seating**: Check `event.availableSeats > 0` before allowing registration; decrement on creation, increment on deletion

## Important Files Reference
- Registration seat logic: [backend/controllers/registrationController.js](backend/controllers/registrationController.js#L9)
- Route protection: [frontend/src/components/common/ProtectedRoute.jsx](frontend/src/components/common/ProtectedRoute.jsx)
- Auth context/state: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx)
- API setup: [frontend/src/services/api.js](frontend/src/services/api.js)
- Auth middleware: [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js)

## Conventions to Maintain
- Use Tailwind CSS for frontend styling; icon library is lucide-react
- Follow existing model schema patterns (enums for role/status, timestamps, references with `ref: "Model"`)
- Always use `asyncHandler` wrapper for async route handlers in backend
- Axios interceptor auto-injects auth token—no manual header injection needed in service calls
