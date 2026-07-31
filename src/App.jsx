// IMPROVEMENT: Refactored App root component with CookieConsent banner, memoized route prefetching, and smooth suspense fallback
import React, { useEffect, useMemo, useRef, useState, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Global Contexts & Toast
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout Components
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import GlobalFX from './components/GlobalFX';
import ToastContainer from './components/ToastContainer';
import CookieConsent from './components/CookieConsent';

function GlobalScrollObserver() {
  const { pathname } = useLocation();

  useEffect(() => {
    const revealSelector = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-glow';

    const revealElementsInViewport = () => {
      const elements = document.querySelectorAll(revealSelector);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 1.15 || !window.IntersectionObserver) {
          el.classList.add('visible');
        }
      });
    };

    revealElementsInViewport();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px 0px 50px 0px' }
    );

    const observeAll = () => {
      document.querySelectorAll(revealSelector).forEach((el) => {
        if (!el.classList.contains('visible')) {
          observer.observe(el);
        }
      });
    };

    observeAll();

    // Re-trigger reveal check when lazy-loaded components mount
    const mutationObserver = new MutationObserver(() => {
      revealElementsInViewport();
      observeAll();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Safety fallback: ensure all elements become visible after 500ms
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll(revealSelector).forEach((el) => {
        el.classList.add('visible');
      });
    }, 500);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}

// Lazy-loaded pages
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
const Wishlist = lazy(() => import('./pages/Wishlist'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

const AppContent = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
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

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const handleOpenCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  return (
    <div className="app-container">
      <GlobalFX />
      <GlobalScrollObserver />

      <GlassNavbar
        theme={theme}
        toggleTheme={toggleTheme}
        onCartClick={handleOpenCart}
        cartButtonRef={(node) => {
          cartButtonRef.current = node;
        }}
      />

      <main className="main-content">
        <Suspense
          fallback={
            <div className="container section flex-col items-center justify-center" style={{ minHeight: '50vh' }}>
              <div className="spinner" />
              <p className="text-muted mt-4">Loading Roshan Enterprises...</p>
            </div>
          }
        >
          <div className="route-transition-shell">
            <Routes location={location}>
              <Route
                path="/"
                element={<Homepage onOpenCart={handleOpenCart} cartButtonRef={cartButtonRef} />}
              />
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
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
              <Route path="/track-order" element={<TrackOrder />} />
            </Routes>
          </div>
        </Suspense>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={handleCloseCart} />
      <Footer />
      <ToastContainer />
      <CookieConsent />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
