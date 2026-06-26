# Friends Door Delivery & Rapido Service - Enterprise Super App

This is a production-ready, enterprise-grade full-stack Super App built for local deliveries (Food, Groceries, Custom shop procurement) and Bike Taxi services (Rapido-style) operating in **Tamil Nadu, India** (specifically Ambasamudram, Papanasam, Vikramasingapuram, and Alwarkurichi).

## 🚀 Key Architectural Features
1. **Mandatory Geofencing**: Coordinates of stores, delivery zones, and ride hubs are evaluated using the Haversine formula on the backend. Bookings outside the radius are automatically rejected.
2. **Dynamic Billing Engine**: Workers can purchase items at custom stores, upload a receipt, and input the actual bill amount. The backend automatically recalculates delivery fees, service charges, and updates the grand total invoice.
3. **Bike Taxi Pricing Engine**: Fare calculations combine a base rate (₹25), distance rates (₹12/KM), and peak hour surge coefficients (1.5x) mapped across a bidirectional local route matrix.
4. **Role-Based Access Control (RBAC)**: Secure routes restricted to Owners, Workers (riders), and Customers with JWT authentication.
5. **Modern Dashboard Design**: Light/Dark theme toggles, glassmorphism card UI, visual SVG route trackers, and micro-animations.

---

## 📂 Repository Structure
```
friends-door-delivery/
├── backend/
│   ├── config/db.js                  # Database connection logic
│   ├── controllers/                  # Express controllers for business logic
│   ├── middleware/                   # JWT, RBAC, Geofencing, and Error handlers
│   ├── models/                       # Mongoose Schemas (User, Worker, Store, etc.)
│   ├── routes/                       # Express router mappings
│   ├── utils/                        # Pricing, geofencing, and route matrix calculators
│   ├── server.js                     # Root server launcher and database seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbars, modal forms, map visualizers, cards
│   │   ├── context/                  # AuthContext for JWT and coordinate syncing
│   │   ├── pages/                    # Owner, Worker, Customer panels & store pages
│   │   ├── styles/theme.css          # Tailwind imports & custom glassmorphism styles
│   │   ├── App.jsx                   # React-Router role-based routes definition
│   │   └── main.jsx                  # Main entry point
│   ├── tailwind.config.js            # Custom color schemes (Teal/Amber)
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
└── README.md                         # Project manual
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Setup
1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/friends_door_delivery
   JWT_SECRET=friends_super_secret_jwt_key_123
   ```
4. Start the server (includes automatic seeding of mock stores and tester credentials):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Credentials
The database seeder automatically seeds the following tester accounts inside MongoDB upon server start:

| Role | Email | Password | Coordinates (Geofenced Zone) |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `owner@friends.com` | `password123` | Ambasamudram (Inside) |
| **Worker / Rider** | `worker@friends.com` | `password123` | Vikramasingapuram (Inside) |
| **Customer** | `customer@friends.com` | `password123` | Papanasam (Inside) |

*Tip: Try changing coordinate registers during login or order placement to test the geofence rejection response.*
