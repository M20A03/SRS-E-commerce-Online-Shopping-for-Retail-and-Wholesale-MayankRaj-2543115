// IMPROVEMENT: GDPR Cookie Consent Banner using js-cookie with preference management
import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './CookieConsent.css';

const COOKIE_NAME = 'roshan_gdpr_consent';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) {
      // Delay initial banner display for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom event from Footer "Manage Cookies" link
  useEffect(() => {
    const handleReopen = () => setIsVisible(true);
    window.addEventListener('open-cookie-consent', handleReopen);
    return () => window.removeEventListener('open-cookie-consent', handleReopen);
  }, []);

  const handleAccept = useCallback(() => {
    Cookies.set(COOKIE_NAME, 'accepted', { expires: 365, sameSite: 'lax' });
    setIsVisible(false);
    if (addToast) addToast('Cookie preferences saved: All cookies accepted.', 'success');
  }, [addToast]);

  const handleDecline = useCallback(() => {
    Cookies.set(COOKIE_NAME, 'declined', { expires: 365, sameSite: 'lax' });
    setIsVisible(false);
    if (addToast) addToast('Cookie preferences saved: Essential cookies only.', 'info');
  }, [addToast]);

  if (!isVisible) return null;

  return (
    <div className="cookie-consent-bar" role="dialog" aria-live="polite" aria-label="Cookie Consent Banner">
      <div className="cookie-consent-content">
        <div className="cookie-consent-header">
          <div className="cookie-consent-icon">
            <Cookie size={24} />
          </div>
          <div>
            <h4 className="cookie-consent-title">We Value Your Privacy</h4>
            <p className="cookie-consent-desc">
              We use cookies and similar technologies to enhance your shopping experience, analyze site traffic, and deliver personalized content in compliance with GDPR.
            </p>
          </div>
        </div>

        <div className="cookie-consent-actions">
          <button type="button" className="btn-cookie btn-cookie--decline" onClick={handleDecline}>
            Essential Only
          </button>
          <button type="button" className="btn-cookie btn-cookie--accept" onClick={handleAccept}>
            <ShieldCheck size={18} />
            Accept All
          </button>
          <button
            type="button"
            className="btn-cookie-close"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CookieConsent);
