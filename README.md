# SRS E-commerce - Online Shopping for Retail and Wholesale

A premium, modern e-commerce web application built for my father **Roshan Enterprises**. This project provides a seamless shopping experience for cooking oils, aromatic teas, detergents, and household essentials.

## 🚀 Features

- **Guest Browsing**: Explore products and categories without needing to sign in.
- **User Authentication**: Secure Login and Registration powered by Firebase.
- **Dynamic Category Filtering**: Browse products by categories with URL-parameter synchronization.
- **Interactive Cart**: Real-time cart management with local persistence.
- **Protected Checkout**: Seamless checkout process for registered users.
- **Order History**: Track past purchases linked to your user account.
- **Premium UI/UX**: Dark mode support, glassmorphism, and smooth animations.

## 🛠️ Technology Stack

- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS
- **Backend/Auth/Database/Storage**: Firebase
- **State Management**: React Context API

## 📷 Firebase Setup

This project now uses Firebase only for auth, database, and image uploads. No Cloudinary, Google Cloud Storage, or data-URL fallback paths remain.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/M20A03/SRS-E-commerce-Online-Shopping-for-Retail-and-Wholesale-MayankRaj-2543115.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Firebase Storage Upload Setup

1. Enable Firebase Storage in the Firebase Console.
2. Add a Storage rule that allows your admin users to upload product images.
3. In the admin app, uploads use Firebase Storage directly.
4. Make sure the Firebase project’s Web App config is present in `src/firebase-config.js` and `admin-app/src/firebase.js`.

### Firebase Admin Secret for Coolify

1. Create a Firebase service account in the Firebase Console or Google Cloud Console.
2. Download the JSON key file.
3. In Coolify, add the JSON as a secret file or mounted secret.
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the file path inside the container.
5. Keep `NODE_ENV=production`, `PORT=8080`, and `CORS_ORIGIN=https://e-commerce-roshan-enterprises-dhn.web.app`.

### Coolify Backend Deployment

Deploy the root app on Coolify as a Docker-based service.

The existing [Dockerfile](Dockerfile) builds the Node server and starts it with `npm start`, so Coolify can run it directly.

Set these environment variables in Coolify:

```bash
PORT=8080
NODE_ENV=production
CORS_ORIGIN=https://e-commerce-roshan-enterprises-dhn.web.app
```

Also add the Firebase service-account JSON as a secret file and point `GOOGLE_APPLICATION_CREDENTIALS` at it.

Coolify settings:

```bash
Build Command: npm install --omit=dev
Start Command: npm start
Port: 8080
```

After deployment, copy the Coolify backend URL and set it in the frontend build environment:

```bash
VITE_ORDER_API_URL=https://YOUR-COOLIFY-BACKEND-URL
```

If you only want to deploy the website, keep the frontend separate and point it to the Coolify backend URL.

## 📝 Project Context

This project was developed as a final project for the 1st semester, focusing on building a functional and aesthetically pleasing e-commerce interface for a real-world business use case.

## 🌐 Live Preview

You can view the live site here: [e-commerce-roshan-enterprises-dhn.web.app](https://e-commerce-roshan-enterprises-dhn.web.app)