import React from 'react';
import './InfoPages.css';

const FAQ = () => {
  return (
    <div className="info-page info-page--faq animate-fade-in">
      <div className="info-shell">
        <div className="info-hero">
          <h1 className="info-title">Frequently Asked Questions</h1>
          <p className="info-lead">Quick answers to common questions about orders, shipping, returns, and accounts.</p>
        </div>

        <div className="info-panel">
          <section className="info-section">
            <h2>How do I place an order?</h2>
            <p>Browse categories, add products to cart, and proceed to checkout to place your order securely.</p>
          </section>
          <section className="info-section">
            <h2>How can I track my order?</h2>
            <p>Open the Track Order page and enter your order ID to view current shipping status.</p>
          </section>
          <section className="info-section">
            <h2>What is the return window?</h2>
            <p>You can request a return within 7 days of delivery for eligible products.</p>
          </section>
          <section className="info-section">
            <h2>Do you offer free shipping?</h2>
            <p>Yes, free shipping is available on qualifying orders as per the shipping policy.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
