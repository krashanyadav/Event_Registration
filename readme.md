# 🎟️ Event Registration System

A full-stack event registration system built with **Express.js**, **MongoDB (Mongoose)**, and vanilla **HTML/CSS/JS** frontend. Users can browse events, register/cancel their registration, and organizers can create and manage their own events.

---

## 📌 Features

- 🔐 **Authentication** — Signup/Login/Logout using JWT stored in secure HTTP-only cookies
- 📅 **Event Management** — Create, view, update, and delete events (organizer-only for write actions)
- 📝 **Registrations** — Users can register for events, view their registrations, and cancel them
- 👥 **Role-based Access** — `user`, `organizer`, and `admin` roles with different permissions
- 🔍 **Search & Pagination** — Search events by title with paginated results
- 🎨 **Basic Frontend UI** — Simple HTML/CSS/JS interface to interact with the API

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Token), bcryptjs, HTTP-only cookies |
| Frontend | HTML, CSS, JavaScript (vanilla) |

---

## 📁 Project Structure

```
event-registration-system/
├── server.js
├── .env
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Event.js
│   └── Registration.js
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   └── registrationController.js
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   └── registrationRoutes.js
├── middleware/
│   └── authMiddleware.js
└── public/               (optional, if serving frontend from backend)
    ├── index.html
    ├── style.css
    └── script.js
```

---

## ⚙️ Installation & Setup

### 1. Clone / navigate to the project folder

```bash
cd event-registration-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root directory

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/eventRegistrationDB
JWT_SECRET=yourSuperSecretKey123
```

> If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 4. Start the server

```bash
npm run dev
```

Server will start at `http://localhost:4000`.

---

## 🖥️ Frontend Setup

The `public/` folder (or a separate `Frontend/` folder) contains `index.html`, `style.css`, and `script.js`.

**Option A — Serve frontend from Express (recommended, avoids CORS issues):**

1. Place `index.html`, `style.css`, `script.js` inside a `public/` folder in the backend project.
2. Add this to `server.js`:
   ```javascript
   const path = require('path');
   app.use(express.static(path.join(__dirname, 'public')));
   ```
3. Update `script.js`:
   ```javascript
   const API = "/api";
   ```
4. Open `http://localhost:4000` in the browser.

**Option B — Run frontend separately (e.g. VS Code Live Server):**

1. Keep `script.js` pointing to the full backend URL:
   ```javascript
   const API = "http://localhost:4000/api";
   ```
2. Configure CORS in `server.js` to allow the frontend's origin:
   ```javascript
   app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));
   ```

---

## 📡 API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register a new user |
| POST | `/login` | Public | Login and receive auth cookie |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Private | Get current logged-in user |
| PUT | `/promote/:userId` | Admin only | Promote a user to organizer |

### Event Routes (`/api/events`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all events (supports `?search=` & `?page=`) |
| GET | `/:id` | Public | Get a single event's details |
| POST | `/` | Organizer only | Create a new event |
| PUT | `/:id` | Organizer only (owner) | Update an event |
| DELETE | `/:id` | Organizer only (owner) | Delete an event |

### Registration Routes (`/api/registrations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/:eventId` | Private | Register for an event |
| GET | `/my` | Private | View my registrations |
| PUT | `/:id/cancel` | Private (owner) | Cancel a registration |
| GET | `/event/:eventId` | Organizer only (owner) | View all registrants for an event |

---

## 🗄️ Data Models

**User**
```
name, email, password (hashed), role [user | organizer | admin]
```

**Event**
```
title, description, date, location, capacity, organizer (ref: User)
```

**Registration**
```
user (ref: User), event (ref: Event), status [confirmed | cancelled]
```
> A unique index on `(user, event)` prevents duplicate registrations.

---

## 🔒 Authentication Flow

1. On signup/login, the server issues a JWT and sets it as an `httpOnly` cookie named `token`.
2. Protected routes use the `protect` middleware to verify the token from the cookie.
3. `organizerOnly` / `adminOnly` middleware restrict access based on user role.

---

## 🧪 Testing with Postman

1. Signup a user → `POST /api/auth/signup`
2. Login → `POST /api/auth/login`
3. Create an event as an organizer → `POST /api/events`
4. Register for an event as a user → `POST /api/registrations/:eventId`
5. View registrations → `GET /api/registrations/my`

> Enable **"Send cookies automatically"** in Postman, or use the Postman cookie jar, since auth relies on cookies rather than Bearer tokens.

---

## 🚀 Future Improvements

- Email confirmation on registration
- Admin dashboard for managing all events/users
- Image upload for event banners
- Waitlist feature when an event reaches capacity

---

## 📄 License

This project is for learning/internship purposes (CodeAlpha Task 2).git