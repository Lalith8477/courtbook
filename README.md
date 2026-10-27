
# CourtBook ⚽

**Sports Court Booking and Management Platform**

CourtBook is a full-stack web application that helps players discover sports courts, check time-slot availability, and book courts online. It also provides court owners with tools to manage their courts and handle booking requests.

**Live Application:** [CourtBook](https://courtbook-xi.vercel.app)  

**Backend API:** [CourtBook Backend](https://courtbook-0kk0.onrender.com)  

**Demo Video:** [Watch the demo](https://drive.google.com/file/d/1rvlZuykj_sRm_iPUBgGPZL03xtGzPH_f/view?usp=drive_link)

---

## Overview

Booking a football turf or sports court often involves contacting the owner, checking available timings, and coordinating the reservation manually. This can be inconvenient for players and difficult for owners when multiple people want the same time slot.

CourtBook brings court discovery, availability checking, and booking management into one platform. Players can find courts and book available slots, while owners can manage their courts and respond to booking requests through a dedicated dashboard.

## Features

### Player Features
- Register and log in.
- Browse sports courts and view court details.
- Search and filter courts by sport, location, price, and text.
- Select a date and view available time slots.
- Book available slots and track booking status.
- Cancel eligible bookings.
- Receive booking notifications and status updates.
- Search using natural-language queries through AI-powered smart search.

### Court Owner Features
- Access a dedicated owner dashboard.
- View booking statistics.
- Add, edit, and manage courts.
- Upload court photos.
- Review incoming booking requests.
- Confirm or reject pending bookings.
- Receive notifications about booking activity.

### Additional Features
- Role-based access for players and owners.
- Dark mode.
- Loading indicators, empty states, and toast notifications.
- Backend validation and error handling.
- Real-time notifications and slot updates using Socket.IO.
- AI-assisted smart search using Google Gemini.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT-based authentication and secure cookies |
| Real-time communication | Socket.IO |
| AI integration | Google Gemini API |
| Image storage | Cloudinary |
| Frontend deployment | Vercel |
| Backend deployment | Render |
| Database hosting | MongoDB Atlas |
| API testing | Postman |
| Version control | Git, GitHub |

## How It Works

### 1. Court Discovery and Availability

Players can browse courts and filter results according to their requirements. Each court contains information such as its sport, location, price, opening hours, and slot duration.

When a player selects a court and date, the application displays the corresponding time slots and their availability.

### 2. Dynamic Slot Generation

CourtBook generates time slots from a court's opening time, closing time, and configured slot duration instead of storing every possible slot as a separate database record.

The backend checks existing bookings to determine which slots are unavailable.

### 3. Booking and Double-Booking Prevention

When a player requests a booking, the backend validates the request and stores the booking in MongoDB.

A partial unique database index on the court, date, and start time for bookings with `pending` or `confirmed` status provides a database-level safeguard against two active bookings claiming the same slot.

If a conflicting booking is attempted, the database rejects the duplicate and the backend handles the conflict. This is more reliable than depending only on frontend checks.

When a booking is cancelled or rejected, the slot can become available again according to the application's booking rules.

### 4. Booking Management

Players can view their bookings and cancel eligible reservations. Court owners can review requests for their own courts and confirm or reject pending bookings.

The backend validates permissions and booking status transitions to prevent unauthorized actions.

### 5. AI-Powered Smart Search

CourtBook integrates Google Gemini to interpret natural-language search requests.

For example:

> Find a football court on Saturday evening within a budget of ₹2,000.

Gemini interprets the request and produces structured search filters. The backend validates those filters and uses the application's court and availability data to find matching results.

The AI helps interpret what the player wants, while the backend remains responsible for applying the filters and determining actual availability.

### 6. Real-Time Notifications

CourtBook uses Socket.IO for real-time communication between the frontend and backend.

Booking-related events can notify players and owners when a booking is created or its status changes. Slot updates can also be delivered to connected users without requiring manual page refreshes.

## Application Architecture

CourtBook follows a frontend-backend architecture.

- **Frontend:** React provides the interface for players and owners.
- **Backend:** Express.js handles API requests, authentication, validation, and booking operations.
- **Database:** MongoDB stores users, courts, bookings, and notifications.
- **Real-time layer:** Socket.IO communicates booking events and updates.
- **AI service:** Gemini interprets natural-language search queries.
- **Image storage:** Cloudinary stores uploaded court photos.

The backend handles the main business rules, including slot availability, booking conflicts, and role-based permissions.

## Project Structure

```text
CourtBook/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket.js
│   ├── index.js
│   └── package.json
│
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── axiosCalls/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   └── socket.js
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database, such as MongoDB Atlas
- A Cloudinary account for court image uploads
- A Google Gemini API key for smart search

### 1. Configure the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```dotenv
PORT=8084
dbURL=your_mongodb_connection_string
JWT_SECRET=your_random_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Use your own credentials and keep the variable names consistent with the backend configuration. Never commit real secrets to GitHub.

Start the backend:

```bash
npm run dev
```

The local backend is configured to run on port `8084`.

### 2. Configure the Frontend

Open a second terminal:

```bash
cd frontend/vite-project
npm install
```

Create a `.env` file in `frontend/vite-project/`:

```dotenv
VITE_API_URL=http://localhost:8084
```

Configure any separate Socket.IO URL variable if your frontend implementation requires one.

Start the frontend:

```bash
npm run dev
```

Vite will display the local URL, usually `http://localhost:5173`.

### 3. Test the Application

1. Register or log in as a player.
2. Browse courts and try the available filters.
3. Select a court and date to inspect available slots.
4. Create a booking and check its status under My Bookings.
5. Log in as an owner and review incoming bookings.
6. Test confirming, rejecting, and cancelling bookings where permitted.
7. Try a natural-language query using smart search.
8. Check notifications and real-time updates.
9. Test invalid inputs and unavailable actions.

Postman can be used to test backend API endpoints independently of the frontend.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Local backend server port |
| `dbURL` | MongoDB connection string |
| `JWT_SECRET` | Secret used for authentication tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Gemini API authentication |
| `GEMINI_MODEL` | Model configured for smart search |
| `CLIENT_URL` | Allowed frontend origin |
| `NODE_ENV` | Application environment |
| `VITE_API_URL` | Frontend API base URL |

Production values are configured through the hosting providers. Never expose database credentials or API secrets in frontend code.

## Deployment

CourtBook is deployed using the following services:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Image storage:** Cloudinary

**Live links**

- Frontend: https://courtbook-xi.vercel.app
- Backend: https://courtbook-0kk0.onrender.com

The frontend communicates with the deployed backend through the configured API routing. The backend uses production environment variables to connect to the database and external services.

## Security and Error Handling

CourtBook includes:

- Authentication middleware for protected API routes.
- Role-based authorization for player and owner operations.
- Ownership checks for court management.
- Backend validation of booking requests and status changes.
- Database-level protection against duplicate active bookings.
- Error handling for invalid requests and booking conflicts.
- Rate limiting on relevant endpoints.
- Environment variables for credentials and API secrets.
- Frontend feedback through loading states, empty states, and toast notifications.

Frontend route protection improves the user experience, while backend authorization enforces access rules.

## Testing

The main workflows to test are:

- Registration, login, and authentication.
- Access to public and protected routes.
- Court creation, editing, and image uploads.
- Court search and filtering.
- Dynamic slot generation.
- Booking creation, cancellation, confirmation, and rejection.
- Duplicate booking attempts for the same slot.
- Real-time notifications and booking updates.
- Gemini smart search.
- Invalid input handling and API error responses.
- The deployed application and backend connection.

A particularly important test is attempting to book the same court, date, and start time more than once while an active booking exists. Both attempts should not succeed.

## Demo Video

**Watch the demo:** [https://drive.google.com/file/d/1rvlZuykj_sRm_iPUBgGPZL03xtGzPH_f/view?usp=drive_link]

The demonstration covers court discovery, slot availability, the player booking workflow, owner-side booking management, smart search, real-time notifications, and the approach used to prevent double bookings.

## Conclusion

CourtBook brings court discovery, availability checking, and booking management into one application for players and court owners.

The project combines a React frontend, an Express backend, MongoDB persistence, database-level booking safeguards, real-time communication, and AI-assisted search to address the practical challenges of sports court booking.
