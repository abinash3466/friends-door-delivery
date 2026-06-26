

##  Friends Door Delivery & Rapido Service -
## Enterprise Full Stack Super App Generation
## Prompt
## ROLE
Act as a World-Class Principal Software Engineer, Enterprise Solutions Architect, Senior Database
Architect, Product Engineer, and Premium UI/UX Designer.
Build a production-grade, enterprise-level, full-stack multi-service Super App named:
## Friends Door Delivery & Rapido Service
The application must be architected as a scalable commercial SaaS-ready platform with clean code, modular
architecture, proper validations, role-based security, responsive UI, and maintainable folder structures.
Generate complete source code files with realistic implementation logic.
## 1. PROJECT OVERVIEW
## Company Name
## Friends Door Delivery & Rapido Service
## Service Area
## Tamil Nadu, India
## Primary Operational Region:
## Ambasamudram
## Papanasam
## Vikramasingapuram
## Alwarkurichi
## Nearby Surrounding Areas
## •
## •
## •
## •
## •
## 1

## Mandatory Geofencing
The platform must operate ONLY inside the configured service zone.
Backend must validate:
Customer coordinates
Worker coordinates
Store coordinates
Ride pickup locations
Ride destination locations
Any request outside the service radius must be rejected.
Example response:
## {
## "success":false,
"message":"Service unavailable outside Friends Door Delivery service zone."
## }
## 2. BUSINESS MODEL
The platform combines:
## Food Delivery
(Zomato / Swiggy Model)
## Features:
Restaurant browsing
## Search
## Categories
## Cart
## Checkout
Live tracking
## Grocery Delivery
(Blinkit / Zepto Model)
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 2

## Features:
Grocery store listings
Category filtering
Fast delivery workflow
Cart system
## Custom Store Pickup & Delivery
(Dunzo Model)
Customer can:
Enter any shop name
Add shopping instructions
Upload optional reference images
Add custom shopping list
## Example:
## Store Name:
## Ganesh Provision Store
## Items:
Milk x2
## Rice 5kg
## Sugar 2kg
## Minimum Order Validation
## Mandatory Rule:
## Minimum Order Value = ₹200
If estimated cart value < ₹200:
## {
## "success":false,
"message":"Minimum order value is ₹200."
## }
## •
## •
## •
## •
## •
## •
## •
## •
## 3

## Dynamic Billing Engine
## Worker Flow:
Visit store
Purchase items
Upload bill image
Enter actual bill amount
Backend must:
Recalculate order totals
Add service charges
Add delivery charges
Generate final invoice
Customer receives:
Updated bill
Payment confirmation
COD confirmation option
Razorpay payment option
## Bike Taxi Service
(Rapido / Ola Bike Model)
## Features:
Pickup selection
Destination selection
Distance calculation
Fare estimation
Ride tracking
## 3. BIKE TAXI PRICING ENGINE
Implement market-based pricing.
## Formula:
## 1.
## 2.
## 3.
## 4.
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 4

## Final Fare =
## Base Fare
## +
(Distance × Per KM Rate)
## +
## Surge Pricing
## Example Config:
BaseFare=₹25
PerKMRate=₹12
PeakSurge=1.5x
## Mock Route Matrix
Include distance mapping between:
RouteKM
## Ambasamudram → Papanasam
## 8
## Ambasamudram → Vikramasingapuram
## 5
## Ambasamudram → Alwarkurichi
## 14
## Papanasam → Alwarkurichi
## 16
## Vikramasingapuram → Alwarkurichi
## 11
Backend must use this matrix for ride calculations.
## 4. ROLE-BASED SYSTEM
Implement complete RBAC.
## Roles:
## OWNER
## WORKER
## CUSTOMER
## 5

JWT Authentication required.
## 5. OWNER DASHBOARD
## Premium Admin Panel.
## Features:
## Analytics
## Display:
## Total Revenue
## Total Orders
## Total Deliveries
## Total Bike Trips
## Daily Revenue
## Weekly Revenue
## Monthly Revenue
## Worker Performance
## Store Management
Owner can:
## Add Store
## Edit Store
## Delete Store
## Disable Store
## Enable Store
## Store Types:
## Restaurant
## Grocery
## Pharmacy
## Bakery
## Provision Store
## Custom Shop
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 6

## Worker Allocation
Owner can:
Track active workers
Reassign orders
Monitor locations
Manage payouts
## 6. WORKER DASHBOARD
## Delivery Partner Interface.
## Features:
## Live Job Feed
## Receive:
## Food Orders
## Grocery Orders
## Custom Orders
## Bike Ride Requests
## Order Actions
Worker can:
## Accept Job
## Reject Job
## Start Pickup
## Confirm Pickup
## Complete Delivery
## Custom Invoice Module
Worker can:
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 7

## Upload Bill Image
## Receipt.jpg
## Enter Final Bill Amount
## ₹540
Backend automatically updates:
## Final Bill
## Service Charge
## Delivery Charge
## Grand Total
## Earnings Dashboard
## Show:
## Today's Earnings
## Weekly Earnings
## Monthly Earnings
## Incentives
## Tips
## Pending Payouts
## 7. CUSTOMER DASHBOARD
Create a premium consumer portal.
## Main Service Cards:
## •
## •
## •
## •
## •
## •
## 8

##  Food Delivery
##  Grocery Delivery
##  Custom Store Pickup
##  Bike Taxi
## Order Tracking Timeline
## Order Received
## ↓
## Worker Assigned
## ↓
## Store Purchase In Progress
## ↓
## Bill Uploaded
## ↓
## Payment Confirmed
## ↓
## Out For Delivery
## ↓
## Completed
Real-time status updates required.
## 8. PREMIUM UI/UX DESIGN SYSTEM
Create luxury-grade interfaces.
## Light Theme
Background:#FAFAFB
Cards:Glassmorphism
Borders:SoftGray
## 9

## Dark Theme
## Background:#121214
Cards:DeepSlate
## Primary Brand Color
## #008080
PremiumTeal
## Secondary Action Color
## #FFBF00
WarmAmber
Used for:
## Place Order
## Book Ride
## Checkout
## Confirm Payment
## Typography
## Use:
## Inter
or
## Plus Jakarta Sans
## Requirements:
Large headings
Spacious layouts
Smooth hover states
Modern shadows
Micro animations
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 10

## 9. TECHNOLOGY STACK
## Frontend
## React.js
## Requirements:
## React Router
Context API
## Axios
Tailwind CSS
## Responsive Mobile First Design
## Backend
## Node.js
## Express.js
## Requirements:
JWT Authentication
## RBAC
REST APIs
## Validation Middleware
## Error Middleware
## Database
MongoDB
## Mongoose
## Collections:
## Users
## Workers
## Stores
## Orders
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 11

## Rides
## Transactions
## Notifications
## 10. REQUIRED PROJECT STRUCTURE
Generate code for every file.
friends-door-delivery-superapp/
backend/
## │
├── config/
│   └── db.js
## │
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── geoFenceMiddleware.js
│   └── errorMiddleware.js
## │
├── controllers/
│   ├── adminController.js
│   ├── orderController.js
│   ├── rideController.js
│   ├── workerController.js
│   └── authController.js
## │
├── models/
## │   ├── User.js
## │   ├── Worker.js
## │   ├── Store.js
## │   ├── Order.js
## │   ├── Ride.js
## │   ├── Transaction.js
## │   └── Notification.js
## │
├── routes/
│   ├── adminRoutes.js
│   ├── orderRoutes.js
│   ├── rideRoutes.js
│   ├── workerRoutes.js
│   └── authRoutes.js
## 12

## │
├── utils/
│   ├── fareCalculator.js
│   ├── routeMatrix.js
│   ├── serviceChargeCalculator.js
│   └── geoFence.js
## │
├── server.js
└── package.json
frontend/
## │
├── src/
## │
├── components/
## │   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── PremiumButton.jsx
│   ├── BillUploadModal.jsx
│   ├── OrderCard.jsx
│   └── MapMockup.jsx
## │
├── pages/
│   ├── CustomerDashboard.jsx
│   ├── OwnerDashboard.jsx
│   ├── WorkerDashboard.jsx
│   ├── StoreManager.jsx
│   ├── FoodPage.jsx
│   ├── GroceryPage.jsx
│   ├── BikeTaxiPage.jsx
│   └── CustomStoreOrder.jsx
## │
├── styles/
│   └── theme.css
## │
## ├── App.jsx
└── package.json
README.md
## 13

## 11. GENERATION REQUIREMENTS
## Generate:
Complete code
No placeholders
No skipped files
Realistic business logic
Professional comments
Production-ready architecture
Responsive UI
Clean reusable components
Enterprise coding standards
Secure backend validations
Modern dashboard interfaces
Return all files in proper file-by-file format suitable for direct ZIP generation.
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## •
## 14