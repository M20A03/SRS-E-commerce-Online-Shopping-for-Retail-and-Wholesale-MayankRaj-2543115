# Roshan Enterprises — Modern E-Commerce Platform

A professional, high-performance, fully functional React e-commerce application built for **Roshan Enterprises** (Retail & Wholesale online store). This platform offers a seamless, sophisticated shopping experience for premium cooking oils, aromatic teas, detergents, and household essentials.

---

## 🌟 Key Enhancements & Refactored Features

- **⚡ Performance & Speed Optimization**:
  - Presentational components wrapped in `React.memo` (`ProductCard`, `CartItem`, `CartDrawer`, `ToastContainer`, `Logo`, `CookieConsent`, `Footer`).
  - Custom `useDebounce` hook for real-time search input and price slider filtering.
  - Efficient product catalog list virtualization with `react-window` for catalog sizes over 50 items.
  - Optimized Firestore database reads with query limits (`limit`), caching, and memoized category derivations.
  - Code-splitting with `React.lazy` and `Suspense` fallback spinner.

- **🎨 Sophisticated Earthy Luxury Design**:
  - Palette inspired by warm earthy luxury tones (`#1e130b`, `#2d1b0e`, `#b28b6e`, `#e8d5c4`, `#faf6f0`).
  - Seamless CSS custom variables (`:root` and `html[data-theme='light']`) for instant dark/light theme switching.
  - Refined typography utilizing Google Fonts (`Inter` for body text and `Playfair Display` for headings).
  - Ambient glassmorphism, subtle glowing background grids, and hardware-accelerated particle FX.

- **🔔 Accessible Toast Feedback**:
  - Global `ToastContext` and `ToastContainer` providing animated feedback for cart modifications, wishlist updates, authentication status, order confirmations, and error alerts.

- **🛡️ GDPR Cookie Consent Banner**:
  - Floating first-visit consent banner storing choice (`accepted`/`declined`) via `js-cookie`.
  - Footer link ("Manage Cookies") allowing users to reopen and adjust their preferences anytime.

- **🏷️ Professional SVG Branding**:
  - Custom vector logo for "Roshan Enterprises" featuring an "R" monogram circle emblem, gradient metallic ring, and tracked typography.

- **🛍️ Complete E-Commerce Workflow**:
  - Functional Shopping Cart with free shipping threshold indicator (`₹500`).
  - Wishlist persistence across sessions in `localStorage`.
  - Real-time Order Tracking with interactive step timeline visualizer (`Order Placed` ➔ `Packed` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`).
  - Multi-option Checkout (UPI QR code scanner, Cash on Delivery) with Firestore order recording.

- **⚙️ Admin Application Wiring**:
  - Dual build system supporting both storefront and admin application (`admin-app/`).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router 7, Vite 5
- **Styling**: Vanilla CSS with CSS Custom Properties, Glassmorphism, Google Fonts (`Inter`, `Playfair Display`)
- **State Management & Context**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`, `ToastContext`)
- **Performance & Utilities**: `React.memo`, `useCallback`, `useMemo`, `react-window`, `js-cookie`, custom `useDebounce` hook
- **Database & Auth**: Firebase Auth (Google Sign-In), Firestore Database, Firebase Storage
- **Icons & Motion**: Lucide React, Framer Motion

---

## 📁 Environment & Firebase Configuration

Create a `.env` file in the project root to set up Firebase and external keys:

```env
VITE_FIREBASE_API_KEY=AIzaSyCSqLi9Iu3CeYOfNH7yPCX32LTyXUR-MBQ
VITE_FIREBASE_AUTH_DOMAIN=react4-eb851.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=react4-eb851
VITE_FIREBASE_STORAGE_BUCKET=react4-eb851.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=438069281435
VITE_FIREBASE_APP_ID=1:438069281435:web:cfd2d4e5ae3c1706d0fc3e
VITE_RECAPTCHA_V3_SITE_KEY=
VITE_ORDER_API_URL=
```

---

## 📦 Local Setup Instructions

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/M20A03/SRS-E-commerce-Online-Shopping-for-Retail-and-Wholesale-MayankRaj-2543115.git
   cd E-commerce-Online-Shopping-for-Retail-and-Wholesale-main
   ```

2. **Install Storefront Dependencies**:
   ```bash
   npm install
   ```

3. **Install Admin App Dependencies**:
   ```bash
   cd admin-app && npm install && cd ..
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build Production Bundles**:
   ```bash
   # Build storefront bundle
   npm run build

   # Build both storefront and admin bundles
   npm run build:all
   ```

---

## 🌐 Deployment Instructions

### 1. Deploying to GitHub Pages

1. Install `gh-pages` helper package:
   ```bash
   npm install -D gh-pages
   ```
2. Update `vite.config.js` with your repository base path if needed:
   ```javascript
   export default defineConfig({
     base: '/SRS-E-commerce-Online-Shopping-for-Retail-and-Wholesale-MayankRaj-2543115/',
     plugins: [react()],
   })
   ```
3. Add deploy scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Run:
   ```bash
   npm run deploy
   ```

### 2. Deploying to Vercel

1. Install Vercel CLI or connect your GitHub repository directly at [vercel.com](https://vercel.com).
2. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variables in Vercel settings under **Environment Variables**.
4. Click **Deploy**.

### 3. Deploying to Netlify

1. Connect your repository on [netlify.com](https://netlify.com).
2. Set build options:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Create a `_redirects` file inside `public/_redirects` for Single Page App routing:
   ```text
   /* /index.html 200
   ```
4. Deploy site.

### 4. Deploying to Firebase Hosting

```bash
npm run build:all
firebase deploy
```

---

## 📝 License & Attribution

Developed for **Roshan Enterprises** (Dhanbad, Jharkhand). All rights reserved.