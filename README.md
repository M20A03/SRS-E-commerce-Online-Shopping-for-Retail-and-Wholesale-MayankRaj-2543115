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
- **Styling**: Vanilla CSS (Custom design system)
- **Icons**: Lucide React
- **Backend/Auth**: Firebase
- **State Management**: React Context API

## 📷 Image Upload Options

The admin app supports multiple image upload flows:

- **Google Cloud Storage**: Use a small signed-URL server and a GCS bucket.
- **Cloudinary**: Optional unsigned upload preset.
- **Firestore data URL fallback**: For small manual uploads when no cloud storage is available.

If you want to use Google Cloud Storage, run the signed upload server and set the env vars from `.env.example`.

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

### Google Cloud Storage Upload Setup

1. Set `GCS_BUCKET` in your shell or `.env` file for the signed URL server.
2. Start the signed URL server:
   ```bash
   npm run gcs-server
   ```
3. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON file that can sign GCS upload URLs.
4. In `admin-app/.env`, set `VITE_GCS_UPLOAD_ENDPOINT=http://localhost:8787/api/gcs/upload-url`.
5. Make sure your GCS bucket is readable by shoppers if you want product images to load directly from the bucket URL.

## 📝 Project Context

This project was developed as a final project for the 1st semester, focusing on building a functional and aesthetically pleasing e-commerce interface for a real-world business use case.

## 🌐 Live Preview

You can view the live site here: [e-commerce-roshan-enterprises-dhn.web.app](https://e-commerce-roshan-enterprises-dhn.web.app)