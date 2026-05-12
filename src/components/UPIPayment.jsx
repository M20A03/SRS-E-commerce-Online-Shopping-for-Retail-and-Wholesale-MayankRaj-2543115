import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './UPIPayment.css';

const UPIPayment = ({ amount, lockedAmount, customerName = 'Roshan Enterprises', onPaymentConfirm }) => {
  const [transactionId, setTransactionId] = useState('');
  const [randomSuffix] = useState(() => Math.floor(Math.random() * 1000000));
  const payableAmount = Number((lockedAmount ?? amount ?? 0).toFixed(2));
  const upiId = 'mayankraj.dhn5-2@okaxis';

  const upiLink = useMemo(
    () => `upi://pay?pa=${upiId}&pn=${encodeURIComponent(customerName)}&am=${payableAmount.toFixed(2)}&tn=Payment%20for%20Order&tr=ORD${randomSuffix}`,
    [customerName, payableAmount, randomSuffix]
  );

  const handleConfirmPayment = () => {
    onPaymentConfirm({
      method: 'upi',
      upiId,
      amount: payableAmount,
      transactionId: transactionId || 'manual-entry',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="upi-payment">
      <div className="upi-payment__content">
        <div className="upi-payment__qr-section">
          <h4 className="upi-payment__subtitle">Scan to Pay</h4>
          <div className="upi-payment__qr-box">
            <QRCodeSVG 
              value={upiLink}
              size={180}
              level="H"
              includeMargin={true}
              className="upi-payment__qr-image"
            />
          </div>
          <div className="upi-payment__mobile-actions">
            <a href={upiLink} className="upi-payment__app-btn">
              Pay via UPI App
            </a>
          </div>
          <p className="upi-payment__hint">Scan the QR code or click the button above to pay <strong>₹{payableAmount.toFixed(2)}</strong></p>
          <div className="upi-payment__security-tip">
            <AlertTriangle size={14} />
            <span>If the "Pay" button shows a security alert, please <strong>Scan the QR code</strong> instead.</span>
          </div>
        </div>

        <div className="upi-payment__manual-section">
          <h4 className="upi-payment__subtitle">Manual payment details</h4>
          <div className="upi-payment__details">
            <div className="upi-payment__detail-row">
              <span className="upi-payment__label">UPI ID:</span>
              <span className="upi-payment__detail-value">{upiId}</span>
            </div>
            <div className="upi-payment__detail-row">
              <span className="upi-payment__label">Amount:</span>
              <span className="upi-payment__detail-value">₹{payableAmount.toFixed(2)}</span>
            </div>
            <div className="upi-payment__detail-row">
              <span className="upi-payment__label">Recipient:</span>
              <span className="upi-payment__detail-value">{customerName}</span>
            </div>
          </div>
        </div>

        <div className="upi-payment__verification">
          <h4 className="upi-payment__subtitle">Transaction reference</h4>
          <input
            type="text"
            className="upi-payment__input"
            placeholder="Enter transaction ID"
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value.toUpperCase())}
          />
        </div>

        <button type="button" className="upi-payment__confirm-btn" onClick={handleConfirmPayment}>
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

export default UPIPayment;
