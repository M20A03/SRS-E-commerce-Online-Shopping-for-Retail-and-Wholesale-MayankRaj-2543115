import { useState } from 'react';
import './Phase2.css';

const timelineSteps = ['Order Placed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];

function buildStatus(code) {
  const value = code.trim().toUpperCase();

  if (value.length < 6) {
    return { error: 'Tracking code not found. Please verify your order or tracking ID and try again.' };
  }

  const bucket = value.length % 4;
  if (bucket === 0) {
    return {
      status: 'Out for Delivery',
      location: 'Lumi Glow local courier hub',
      eta: 'Arriving today by 8:00 PM',
      currentStep: 3,
      details: 'Your package is with the delivery partner and should reach you very soon.',
    };
  }

  if (bucket === 1) {
    return {
      status: 'In Transit',
      location: 'Regional sorting center',
      eta: 'Arriving in 2 to 3 days',
      currentStep: 2,
      details: 'Your order is moving through the shipping network and is on schedule.',
    };
  }

  if (bucket === 2) {
    return {
      status: 'Packed',
      location: 'Lumi Glow fulfillment center',
      eta: 'Carrier pickup in 12 to 24 hours',
      currentStep: 1,
      details: 'Your order is packed and queued for handoff to the courier.',
    };
  }

  return {
    status: 'Delivered',
    location: 'Delivered to your address',
    eta: 'Delivered successfully',
    currentStep: 4,
    details: 'Your package has been delivered. If anything is missing, contact support within 48 hours.',
  };
}

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTrack = (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    window.setTimeout(() => {
      setResult(buildStatus(trackingCode));
      setLoading(false);
    }, 900);
  };

  const openConcierge = () => {
    window.dispatchEvent(new CustomEvent('open-dh-concierge'));
  };

  return (
    <div className="p2-track-page">
      <section className="p2-track-hero">
        <div className="container p2-track-hero-inner reveal">
          <p className="section-label">Shipping and Delivery</p>
          <h1>Track Your Lumi Glow Order</h1>
          <p>Enter your order number or courier tracking code and get a live delivery snapshot in seconds.</p>
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
                placeholder="Example: LG12345678"
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
            <p className="p2-track-help">Need help finding your code? Check your order confirmation email.</p>
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
                  <span>Expected Update</span>
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
            <p>Domestic orders usually arrive in 3 to 5 business days. Express service is available at checkout.</p>
          </article>
          <article>
            <h4>Processing Window</h4>
            <p>Orders placed before 1:00 PM are typically processed the same day on working days.</p>
          </article>
          <article>
            <h4>Need Extra Help?</h4>
            <p>If your order looks delayed, launch our concierge and we will guide your next step quickly.</p>
            <button type="button" className="btn btn-outline" onClick={openConcierge}>Open Concierge</button>
          </article>
        </div>
      </section>
    </div>
  );
}
