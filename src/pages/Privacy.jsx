import React from 'react';
import './InfoPages.css';

const Privacy = () => {
  return (
    <div className="info-page info-page--privacy animate-fade-in">
      <div className="info-shell">
        <div className="info-hero">
          <h1 className="info-title">Privacy Policy</h1>
          <p className="info-lead">Your privacy matters to us. This page explains what data we collect and how we use it.</p>
        </div>

        <div className="info-panel">
          <section className="info-section">
            <h2>Information We Collect</h2>
            <ul>
              <li>Account details such as name, email, and phone number.</li>
              <li>Order and payment related transaction data.</li>
              <li>Website usage data to improve service quality.</li>
            </ul>
          </section>
          <section className="info-section">
            <h2>How We Use Data</h2>
            <ul>
              <li>To process and deliver your orders.</li>
              <li>To provide customer support and account security.</li>
              <li>To improve product recommendations and website experience.</li>
            </ul>
          </section>
          <section className="info-section">
            <h2>Data Protection</h2>
            <p>We use secure systems and restricted access controls to protect customer information.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
