import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Global Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';

// Page Components
import Homepage from './pages/Homepage';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';

const AppContent = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [disableRouteMotion, setDisableRouteMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches;
  });
  const cartButtonRef = useRef(null);
  const location = useLocation();
  const MotionDiv = motion.div;

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
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)');
    const applyRouteMotionPreference = () => {
      setDisableRouteMotion(mediaQuery.matches);
    };

    applyRouteMotionPreference();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyRouteMotionPreference);
    } else {
      mediaQuery.addListener(applyRouteMotionPreference);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', applyRouteMotionPreference);
      } else {
        mediaQuery.removeListener(applyRouteMotionPreference);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <div className="global-atmosphere" aria-hidden="true">
        <span className="global-atmosphere__beam global-atmosphere__beam--1" />
        <span className="global-atmosphere__beam global-atmosphere__beam--2" />
        <span className="global-atmosphere__spark global-atmosphere__spark--1" />
        <span className="global-atmosphere__spark global-atmosphere__spark--2" />
        <span className="global-atmosphere__spark global-atmosphere__spark--3" />
        <span className="global-atmosphere__spark global-atmosphere__spark--4" />
        <span className="global-atmosphere__spark global-atmosphere__spark--5" />
        <span className="global-atmosphere__spark global-atmosphere__spark--6" />
        <span className="global-atmosphere__spark global-atmosphere__spark--7" />
        <span className="global-atmosphere__spark global-atmosphere__spark--8" />
      </div>

      <GlassNavbar
        theme={theme}
        toggleTheme={toggleTheme}
        onCartClick={() => setIsCartOpen(true)}
        cartButtonRef={(node) => {
          cartButtonRef.current = node;
        }}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={location.pathname}
            className="route-transition-shell"
            initial={disableRouteMotion ? false : { opacity: 0, y: 24, scale: 0.99 }}
            animate={disableRouteMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={disableRouteMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.995 }}
            transition={disableRouteMotion ? { duration: 0.18, ease: 'linear' } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/"
                element={<Homepage onOpenCart={() => setIsCartOpen(true)} cartButtonRef={cartButtonRef} />}
              />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
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
          </MotionDiv>
        </AnimatePresence>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
