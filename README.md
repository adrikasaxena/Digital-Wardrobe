# Digital Wardrobe

## Overview

Digital Wardrobe is a full-stack e-commerce web application built using a MERN-style architecture (MongoDB, Express.js, React, Node.js).

The platform simulates an online clothing store integrated with an interactive Outfit Builder that allows users to visually create, customize, save, and purchase outfits before checkout.

This project demonstrates authentication, RESTful API development, drag-and-drop UI interaction, file uploads, and full-stack data flow management.


## Core Features

### E-Commerce System
- Browse products through the Shop page
- View product details
- Add products to cart
- Simulated checkout process
- Secure user authentication (JWT-based)

### Interactive Outfit Builder

The Outfit Builder enables users to visually construct outfits before purchasing.

Users can:
- Drag and drop items from the Shop into the builder
- Create category-based outfits:
  - Top
  - Bottom
  - Dress
  - Shoes
  - Two Accessories
- Save outfits to their profile
- Edit previously saved outfits
- Delete saved outfits
- Add saved outfits directly to cart

### Custom Item Upload

Users can upload personal clothing items (e.g., a T-shirt they already own) and combine them with store products.

This enables:
- Image upload of personal items
- Styling owned clothing with store products
- Saving custom combinations
- Planning purchases visually before buying

### Simulated Payment Flow

The checkout process is simulated for demonstration purposes.  
No real payment gateway is integrated.

---

## Tech Stack

### Frontend
- React (with Vite)
- react-router-dom
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
### Database
- MongoDB (via Mongoose)

### Authentication & Security
- jsonwebtoken (JWT)
- bcryptjs

### File Handling
- multer

### Backend Utilities
- cors
- dotenv

---

## Architecture

Digital Wardrobe follows a client-server architecture:

- React (Vite) handles UI rendering and state management.
- react-router-dom manages client-side routing.
- Express provides RESTful API endpoints.
- MongoDB stores users, products, carts, and saved outfits.
- JWT handles authentication and protected routes.
- Multer processes file uploads for user-added clothing items.

---
## Folder Structure

root/
│
├── frontend/
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── routes/
│ └── assets/
│
├── backend/
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── middleware/
| ├── uploads/
│ └── config/
│
└── README.md


## Installation

### 1. Clone the Repository
### 2. Install Dependencies

Frontend:

cd frontend
npm install


Backend:

cd backend
npm install


### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


### 4. Run the Application

Backend:

node server.js


Frontend:

npm run dev


---

## Key Learning Outcomes

- Full-stack MERN architecture implementation
- RESTful API design and integration
- Authentication and route protection using JWT
- Password hashing with bcryptjs
- Drag-and-drop interface logic
- File upload handling with multer
- Structured state management in React
- CRUD operations across multiple models
- Simulated transaction workflows

---


## Future Enhancements

- Integration of a real payment gateway (Stripe / Razorpay)
- AI-based outfit recommendation system
- Image-based color and style compatibility suggestions
- AR-based virtual try-on functionality
- Real-time camera overlay for outfit visualization
- 3D avatar-based outfit preview system
- Mobile responsiveness optimization
- Deployment with CI/CD pipeline
- Unit and integration testing

---

## Author

Adrika  Saxena
Bachelor of Technology, Computer Science & Engineering
Amity University, Noida


