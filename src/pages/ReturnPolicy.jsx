import React from 'react';
import './InfoPages.css';

const ReturnPolicy = () => {
  return (
    <div className="info-page info-page--returns animate-fade-in">
      <div className="info-shell">
        <div className="info-hero">
          <h1 className="info-title">Return Policy</h1>
          <p className="info-lead">Simple return process for eligible products to ensure a hassle-free experience.</p>
        </div>

        <div className="info-panel">
          <section className="info-section">
            <h2>Return Window</h2>
            <p>Returns can be requested within 7 days of delivery for eligible items.</p>
          </section>
          <section className="info-section">
            <h2>Eligibility</h2>
            <ul>
              <li>Product must be unused and in original packaging.</li>
              <li>Invoice or order confirmation is required.</li>
              <li>Damaged or wrong items should be reported quickly with photos.</li>
            </ul>
          </section>
          <section className="info-section">
            <h2>Refund Process</h2>
            <p>After quality check, approved refunds are processed to the original payment method in 5 to 7 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
