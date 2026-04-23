import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, ChevronRight, LogOut, Menu, Moon, Phone, ShoppingCart, Sparkles, Sun, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './GlassNavbar.css';

const MagneticButton = ({ children, className = '', onClick, ariaLabel, buttonRef }) => {
  const innerRef = useRef(null);
  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof buttonRef === 'function') {
      buttonRef(node);
    }
  };

  const handleMove = (event) => {
    const node = innerRef.current;
    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;
    const distance = Math.min(20, Math.sqrt(distanceX * distanceX + distanceY * distanceY));

    if (distance >= 20) {
      node.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    const ratio = (20 - distance) / 20;
    node.style.transform = `translate3d(${distanceX * 0.18 * ratio}px, ${distanceY * 0.18 * ratio}px, 0)`;
  };

  const handleLeave = () => {
    if (innerRef.current) {
      innerRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  return (
    <button
      ref={setRefs}
      type="button"
      aria-label={ariaLabel}
      className={`magnetic-button ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const GlassNavbar = ({ theme, toggleTheme, onCartClick, cartButtonRef }) => {
  const { getCartCount } = useCart();
  const { user, login, register, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSession, setOtpSession] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    displayName: '',
    email: '',
    password: ''
  });

  const cartCount = getCartCount();
  const currentDomain = typeof window !== 'undefined' ? window.location.host : '';

  const navLinks = useMemo(() => ([
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/categories', label: 'Categories' },
    { to: '/orders', label: 'Orders' }
  ]), []);
  const MotionHeader = motion.header;
  const MotionDiv = motion.div;

  useEffect(() => {
    setMobileOpen(false);
    setAuthOpen(false);
    setOtpSession(null);
    setOtpInput('');
    setPhoneInput('');
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setAuthOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (authOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [authOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const email = authForm.email.trim();
    const password = authForm.password.trim();
    const displayName = authForm.displayName.trim();

    try {
      const response = authMode === 'login'
        ? await login(email, password)
        : await register(email, password, displayName);

      if (response.success) {
        setAuthOpen(false);
        setAuthForm({ displayName: '', email: '', password: '' });
        navigate('/');
      } else {
        setAuthError(response.error || 'Unable to authenticate');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        setAuthOpen(false);
        navigate('/');
      } else {
        setAuthError(result.error || 'Unable to continue with Google');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const result = await sendPhoneOtp(phoneInput, 'recaptcha-container');
      if (result.success) {
        setOtpSession(result.confirmationResult);
      } else {
        setAuthError(result.error || 'Unable to send OTP');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError('');
    setAuthLoading(true);

    try {
      const profileData = authMode === 'register' ? { displayName: authForm.displayName.trim() } : {};
      const result = await verifyPhoneOtp(otpSession, otpInput, profileData);

      if (result.success) {
        setAuthOpen(false);
        setOtpSession(null);
        setOtpInput('');
        setPhoneInput('');
        navigate('/');
      } else {
        setAuthError(result.error || 'Invalid OTP');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <MotionHeader
        className="glass-navbar glass-navbar__shell"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="glass-navbar__inner">
          <Link to="/" className="glass-navbar__brand">
            <span className="glass-navbar__brand-mark">
              <Sparkles size={18} />
            </span>
            <span className="glass-navbar__brand-copy">
              <span className="glass-navbar__brand-title">Roshan Enterprises</span>
              <span className="glass-navbar__brand-subtitle">Cooking oils, teas, detergent</span>
            </span>
          </Link>

          <nav className="glass-navbar__links" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`glass-navbar__link ${location.pathname === link.to ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="glass-navbar__actions">
            <MagneticButton
              className="glass-button--soft glass-navbar__icon-button"
              ariaLabel="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </MagneticButton>

            <MagneticButton
              className="glass-button--soft glass-navbar__icon-button glass-navbar__cart"
              ariaLabel="Open cart"
              onClick={onCartClick}
              buttonRef={cartButtonRef}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="glass-navbar__badge">{cartCount}</span>}
            </MagneticButton>

            {user ? (
              <>
                <div className="glass-navbar__auth-panel">
                  <button type="button" className="glass-button glass-button--soft" onClick={() => navigate('/account')}>
                    <span className="glass-navbar__avatar">
                      <User size={16} />
                    </span>
                    <span className="glass-navbar__user-copy">
                      <span className="glass-navbar__user-label">Signed in as</span>
                      <span className="glass-navbar__user-name">{user.displayName || user.email}</span>
                    </span>
                  </button>
                </div>
                <MagneticButton
                  className="glass-button--ghost glass-navbar__icon-button"
                  ariaLabel="Logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                </MagneticButton>
              </>
            ) : (
              <MagneticButton
                className="glass-button--primary"
                ariaLabel="Open sign in dialog"
                onClick={() => {
                  setAuthMode('login');
                  setAuthOpen(true);
                }}
              >
                <User size={17} />
                Sign in
              </MagneticButton>
            )}

            <MagneticButton
              className="glass-button--soft glass-navbar__icon-button glass-navbar__menu-button"
              ariaLabel="Open menu"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </MagneticButton>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <MotionDiv
              className="glass-navbar__mobile-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <div className="glass-navbar__mobile-stack">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} className="glass-button glass-button--soft glass-navbar__mobile-link">
                    {link.label}
                    <ChevronRight size={16} />
                  </Link>
                ))}
                <button type="button" className="glass-button glass-button--soft glass-navbar__mobile-action" onClick={onCartClick}>
                  <ShoppingCart size={16} />
                  Cart {cartCount > 0 ? `(${cartCount})` : ''}
                </button>
                <button type="button" className="glass-button glass-button--soft glass-navbar__mobile-action" onClick={toggleTheme}>
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  Toggle theme
                </button>
                {user ? (
                  <button type="button" className="glass-button glass-button--soft glass-navbar__mobile-action" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    className="glass-button glass-button--primary glass-navbar__mobile-action"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthOpen(true);
                    }}
                  >
                    <User size={16} />
                    Sign in
                  </button>
                )}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionHeader>

      <AnimatePresence>
        {authOpen && (
          <MotionDiv
            className="glass-navbar__modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setAuthOpen(false)}
          >
            <MotionDiv
              className="glass-navbar__modal glass-modal"
              initial={{ y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="glass-navbar__modal-top">
                <div>
                  <h2 className="glass-navbar__modal-title">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
                  <p className="glass-navbar__modal-copy">Sign in securely to continue shopping premium daily essentials.</p>
                </div>
                <MagneticButton className="glass-button--soft glass-navbar__icon-button" ariaLabel="Close dialog" onClick={() => setAuthOpen(false)}>
                  <X size={18} />
                </MagneticButton>
              </div>

              <div className="glass-navbar__tabs" role="tablist" aria-label="Authentication mode">
                <button type="button" className={`glass-navbar__tab ${authMode === 'login' ? 'is-active' : ''}`} onClick={() => setAuthMode('login')}>
                  Sign in
                </button>
                <button type="button" className={`glass-navbar__tab ${authMode === 'register' ? 'is-active' : ''}`} onClick={() => setAuthMode('register')}>
                  Sign up
                </button>
              </div>

              {authError && <div className="glass-navbar__error">{authError}</div>}

              <div className="glass-navbar__social-actions">
                <button type="button" className="glass-button glass-button--soft" onClick={handleGoogleLogin} disabled={authLoading}>
                  <Chrome size={16} />
                  Continue with Google
                </button>
                {authError.includes('Google login blocked for this domain') && (
                  <p className="glass-navbar__hint" style={{ marginTop: '0.2rem' }}>
                    Add <strong>{currentDomain}</strong> in Firebase Authentication settings under Authorized domains.
                  </p>
                )}
              </div>

              <div className="glass-navbar__divider" aria-hidden="true">or</div>

              <form className="glass-navbar__form" onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div className="glass-navbar__field-group">
                    <label className="glass-navbar__field">
                      <span className="glass-navbar__label">Full name</span>
                      <input
                        className="glass-navbar__input"
                        type="text"
                        value={authForm.displayName}
                        onChange={(event) => setAuthForm((previous) => ({ ...previous, displayName: event.target.value }))}
                        placeholder="Enter your name"
                        required
                      />
                    </label>
                    <div className="glass-navbar__field" />
                  </div>
                )}

                <label className="glass-navbar__field">
                  <span className="glass-navbar__label">Email</span>
                  <input
                    className="glass-navbar__input"
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm((previous) => ({ ...previous, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="glass-navbar__field">
                  <span className="glass-navbar__label">Password</span>
                  <input
                    className="glass-navbar__input"
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm((previous) => ({ ...previous, password: event.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                </label>

                <p className="glass-navbar__hint">
                  By continuing, you agree to our terms and privacy policy.
                </p>

                <button type="submit" className="glass-button glass-button--primary" disabled={authLoading}>
                  {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <div className="glass-navbar__divider" aria-hidden="true">or sign in with phone</div>

              <div className="glass-navbar__form glass-navbar__phone-auth">
                <label className="glass-navbar__field">
                  <span className="glass-navbar__label">Phone number (E.164 format)</span>
                  <div className="glass-navbar__phone-row">
                    <input
                      className="glass-navbar__input"
                      type="tel"
                      value={phoneInput}
                      onChange={(event) => setPhoneInput(event.target.value)}
                      placeholder="+919876543210"
                      disabled={authLoading}
                    />
                    <button type="button" className="glass-button glass-button--soft" onClick={handleSendOtp} disabled={authLoading || !phoneInput.trim()}>
                      <Phone size={16} />
                      Send OTP
                    </button>
                  </div>
                </label>

                {otpSession && (
                  <>
                    <label className="glass-navbar__field">
                      <span className="glass-navbar__label">Enter OTP</span>
                      <input
                        className="glass-navbar__input"
                        type="text"
                        inputMode="numeric"
                        value={otpInput}
                        onChange={(event) => setOtpInput(event.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        disabled={authLoading}
                      />
                    </label>

                    <button type="button" className="glass-button glass-button--primary" onClick={handleVerifyOtp} disabled={authLoading || otpInput.trim().length !== 6}>
                      Verify OTP
                    </button>
                  </>
                )}

                <div id="recaptcha-container" className="glass-navbar__recaptcha" />
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlassNavbar;
