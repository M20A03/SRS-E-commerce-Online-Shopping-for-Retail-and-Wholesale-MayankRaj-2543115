import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import './UPIPayment.css';

const UPIPayment = ({ amount, customerName = 'Roshan Enterprises', onPaymentConfirm }) => {
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [verificationMode, setVerificationMode] = useState('link'); // 'link' or 'manual'

  // Your UPI ID - Replace with your actual UPI ID
  const UPI_ID = 'roshan.enterprises@upi'; // Change this to your actual UPI ID
  
  // Generate UPI link
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(customerName)}&am=${amount}&tn=Payment%20for%20Order&tr=ORD${Math.floor(Math.random() * 1000000)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (verificationMode === 'manual' && !transactionId) {
      alert('Please enter transaction ID');
      return;
    }
    
    onPaymentConfirm({
      method: 'upi',
      upiId: UPI_ID,
      amount,
      transactionId: transactionId || 'auto-generated',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="upi-payment">
      <div className="upi-payment__content">
        {/* QR Code Section */}
        <div className="upi-payment__qr-section">
          <h4 className="upi-payment__subtitle">Scan to Pay</h4>
          <div className="upi-payment__qr-box">
            <QRCodeSVG 
              value={upiLink} 
              size={200} 
              level="H" 
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="upi-payment__hint">
            Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
          </p>
        </div>

        {/* Divider */}
        <div className="upi-payment__divider">
          <span>or</span>
        </div>

        {/* Manual Payment Section */}
        <div className="upi-payment__manual-section">
          <h4 className="upi-payment__subtitle">Pay Manually</h4>
          
          <div className="upi-payment__details">
            <div className="upi-payment__detail-row">
              <span className="upi-payment__label">UPI ID:</span>
              <div className="upi-payment__detail-value">
                <span>{UPI_ID}</span>
                <button 
                  type="button"
                  className="upi-payment__copy-btn"
                  onClick={handleCopyUPI}
                  title="Copy UPI ID"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="upi-payment__detail-row">
              <span className="upi-payment__label">Amount:</span>
              <span className="upi-payment__detail-value">₹{amount.toFixed(2)}</span>
            </div>

            <div className="upi-payment__detail-row">
              <span className="upi-payment__label">Recipient:</span>
              <span className="upi-payment__detail-value">{customerName}</span>
            </div>
          </div>

          <p className="upi-payment__instruction">
            Open your UPI app and send ₹{amount.toFixed(2)} to the above UPI ID
          </p>
        </div>

        {/* Verification Section */}
        <div className="upi-payment__verification">
          <h4 className="upi-payment__subtitle">Verify Payment</h4>
          
          <div className="upi-payment__verification-mode">
            <label className={`upi-payment__mode-option ${verificationMode === 'link' ? 'active' : ''}`}>
              <input
                type="radio"
                name="verification"
                value="link"
                checked={verificationMode === 'link'}
                onChange={(e) => setVerificationMode(e.target.value)}
              />
              <span>Auto-verify (Recommended)</span>
            </label>
            <label className={`upi-payment__mode-option ${verificationMode === 'manual' ? 'active' : ''}`}>
              <input
                type="radio"
                name="verification"
                value="manual"
                checked={verificationMode === 'manual'}
                onChange={(e) => setVerificationMode(e.target.value)}
              />
              <span>Manual Entry</span>
            </label>
          </div>

          {verificationMode === 'manual' && (
            <div className="upi-payment__manual-input">
              <label className="upi-payment__label">Transaction ID / Reference No.</label>
              <input
                type="text"
                className="upi-payment__input"
                placeholder="e.g., 123456789ABC"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
              />
              <p className="upi-payment__hint">
                Find this in your UPI app transaction history
              </p>
            </div>
          )}
        </div>

        {/* Payment Button */}
        <button 
          type="button"
          className="upi-payment__confirm-btn"
          onClick={handleConfirmPayment}
        >
          Confirm Payment
        </button>

        {/* Safety Info */}
        <div className="upi-payment__safety-info">
          <p>🔒 Your payment information is secure. This payment will be verified and your order will be confirmed.</p>
        </div>
      </div>
    </div>
  );
};

export default UPIPayment;
