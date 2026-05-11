import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Global Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import SparkleCanvas from './components/SparkleCanvas';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';

const Homepage = lazy(() => import('./pages/Homepage'));
const Categories = lazy(() => import('./pages/Categories'));
const Account = lazy(() => import('./pages/Account'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const About = lazy(() => import('./pages/About'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));


const AppContent = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartButtonRef = useRef(null);
  const location = useLocation();
  const prefetchedRoutes = useMemo(() => ['/categories', '/cart', '/checkout', '/account'], []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const supportsBackdrop = typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', 'blur(1px)');
    document.documentElement.classList.toggle('no-backdrop-filter', !supportsBackdrop);
  }, []);

  useEffect(() => {
    prefetchedRoutes.forEach((route) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.href = route;
      document.head.appendChild(link);
    });
  }, [prefetchedRoutes]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <SparkleCanvas />

      <GlassNavbar
        theme={theme}
        toggleTheme={toggleTheme}
        onCartClick={() => setIsCartOpen(true)}
        cartButtonRef={(node) => {
          cartButtonRef.current = node;
        }}
      />

      <main className="main-content">
        <Suspense fallback={<div className="spinner">Loading...</div>}>
          <div className="route-transition-shell">
            <Routes location={location}>
              <Route
                path="/"
                element={<Homepage onOpenCart={() => setIsCartOpen(true)} cartButtonRef={cartButtonRef} />}
              />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
            </Routes>
          </div>
        </Suspense>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer />
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
