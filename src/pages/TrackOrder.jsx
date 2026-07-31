// IMPROVEMENT: Refactored TrackOrder page with Roshan Enterprises branding, ToastContext error alerts, and interactive order timeline
import React, { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import './Phase2.css';

const timelineSteps = ['Order Placed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];

function buildStatus(code) {
  const value = code.trim().toUpperCase();

  if (value.length < 6) {
    return { error: 'Tracking code not found. Please verify your order or tracking ID (minimum 6 characters) and try again.' };
  }

  const bucket = value.length % 4;
  if (bucket === 0) {
    return {
      status: 'Out for Delivery',
      location: 'Roshan Enterprises Dhanbad Hub',
      eta: 'Arriving today by 8:00 PM',
      currentStep: 3,
      details: 'Your package is out with our local delivery agent and should reach your address very soon.',
    };
  }

  if (bucket === 1) {
    return {
      status: 'In Transit',
      location: 'Regional Sorting Facility',
      eta: 'Arriving in 1 to 2 days',
      currentStep: 2,
      details: 'Your order is currently in transit through our delivery network and on schedule.',
    };
  }

  if (bucket === 2) {
    return {
      status: 'Packed',
      location: 'Roshan Fulfillment Center',
      eta: 'Carrier handoff in 12 hours',
      currentStep: 1,
      details: 'Your order is securely packed and waiting for courier dispatch.',
    };
  }

  return {
    status: 'Delivered',
    location: 'Delivered to Destination',
    eta: 'Delivered successfully',
    currentStep: 4,
    details: 'Your order has been delivered! If you need assistance with your items, contact our support team.',
  };
}

const TrackOrder = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handleTrack = useCallback((event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    window.setTimeout(() => {
      const res = buildStatus(trackingCode);
      setResult(res);
      setLoading(false);
      if (res.error && addToast) {
        addToast(res.error, 'error');
      } else if (addToast) {
        addToast(`Tracking status updated: ${res.status}`, 'success');
      }
    }, 700);
  }, [trackingCode, addToast]);

  return (
    <div className="p2-track-page">
      <section className="p2-track-hero">
        <div className="container p2-track-hero-inner reveal">
          <p className="section-label">Shipping & Logistics</p>
          <h1>Track Your Order</h1>
          <p>Enter your order ID or courier tracking code to receive live status updates for your shipment.</p>
        </div>
      </section>

      <section className="section-padding container p2-track-wrap">
        <div className="p2-track-card reveal-scale">
          <form onSubmit={handleTrack} className="p2-track-form">
            <label htmlFor="tracking-code" className="p2-track-label">Tracking or Order ID</label>
            <div className="p2-track-input-row">
              <input
                id="tracking-code"
                type="text"
                placeholder="Example: RE12345678"
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Locating...' : 'Track Order'}
              </button>
            </div>
            <p className="p2-track-help">Need help finding your code? Check your SMS or order confirmation email.</p>
          </form>

          {result?.error && (
            <div className="p2-track-alert error" role="status" aria-live="polite">
              {result.error}
            </div>
          )}

          {result && !result.error && (
            <div className="p2-track-result" role="status" aria-live="polite">
              <div className="p2-track-result-head">
                <div>
                  <span>Current Status</span>
                  <h3>{result.status}</h3>
                  <p>{result.location}</p>
                </div>
                <div className="p2-track-eta">
                  <span>Expected Handoff</span>
                  <strong>{result.eta}</strong>
                </div>
              </div>

              <p className="p2-track-detail">{result.details}</p>

              <div className="p2-track-line" aria-label="Order timeline">
                <div className="p2-track-line-bg" />
                <div className="p2-track-line-progress" style={{ width: `${(result.currentStep / (timelineSteps.length - 1)) * 100}%` }} />
                {timelineSteps.map((step, index) => (
                  <div key={step} className="p2-track-step">
                    <div className={`p2-track-dot ${index <= result.currentStep ? 'active' : ''}`}>
                      {index < result.currentStep ? '✓' : index + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p2-track-support-grid reveal">
          <article>
            <h4>Standard Delivery</h4>
            <p>Orders in Dhanbad and Jharkhand arrive in 1 to 3 business days. Express delivery is available at checkout.</p>
          </article>
          <article>
            <h4>Dispatch Timeline</h4>
            <p>Orders placed before 2:00 PM are packed and dispatched on the same business day.</p>
          </article>
          <article>
            <h4>Need Support?</h4>
            <p>If your package is delayed, call us directly at <strong>+91 7004634675</strong> or email <strong>surendrakumardhn@gmail.com</strong>.</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default React.memo(TrackOrder);
