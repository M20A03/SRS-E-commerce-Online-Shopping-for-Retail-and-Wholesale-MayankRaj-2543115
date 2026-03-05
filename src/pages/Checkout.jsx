import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    useEffect(() => {
        if (cart.length === 0 && !orderComplete) {
            navigate('/cart');
        }
        if (!user) {
            navigate('/login');
        }
    }, [cart.length, user, navigate, orderComplete]);

    const handleCheckout = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call for payment processing
        setTimeout(() => {
            setIsProcessing(false);

            // Save order to history
            const newOrder = {
                id: `ORD-${Math.floor(Math.random() * 1000000)}`,
                date: new Date().toISOString(),
                items: [...cart],
                total: getCartTotal(),
                status: 'Processing',
                paymentMethod
            };

            const existingOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
            localStorage.setItem('luxe_orders', JSON.stringify([[user.email, newOrder], ...existingOrders]));

            setOrderComplete(true);
            clearCart();
        }, 2000);
    };

    if (orderComplete) {
        return (
            <div className="container section flex-col items-center justify-center animate-fade-in" style={{ minHeight: '60vh', textAlign: 'center' }}>
                <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '2rem' }} />
                <h1 className="heading-1 mb-4">Payment Successful!</h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
                    Thank you for your order. We are processing it now and will email you with shipping details shortly.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                    View Order History
                </button>
            </div>
        );
    }

    return (
        <div className="container section animate-fade-in">
            <h1 className="heading-1 mb-6">Checkout</h1>

            <div className="checkout-layout">
                <div className="checkout-form-container">

                    {/* Shipping Form (Read only from user profile for simplicity, could be editable) */}
                    <div className="card checkout-section">
                        <h3 className="heading-3 mb-4 border-bottom">Shipping Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">First Name</label>
                                <input type="text" className="input bg-readonly" value={user?.firstName || ''} readOnly />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input type="text" className="input bg-readonly" value={user?.lastName || ''} readOnly />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="label">Contact Number</label>
                            <input type="text" className="input bg-readonly" value={user?.contact || ''} readOnly />
                        </div>
                        <div className="mt-4">
                            <label className="label">Shipping Address</label>
                            <textarea className="input" rows="3" placeholder="Enter your full shipping address..." required></textarea>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="card checkout-section mt-6">
                        <h3 className="heading-3 mb-4 border-bottom">Payment Method</h3>

                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                />
                                <CreditCard size={24} />
                                <span>Credit / Debit Card</span>
                            </label>

                            <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                />
                                <Smartphone size={24} />
                                <span>UPI Payment</span>
                            </label>
                        </div>

                        {/* Payment Forms */}
                        {paymentMethod === 'card' && (
                            <div className="payment-form animate-fade-in">
                                <div className="mt-4">
                                    <label className="label">Card Number</label>
                                    <input type="text" className="input" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="label">Expiry Date</label>
                                        <input type="text" className="input" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="label">CVV</label>
                                        <input type="text" className="input" placeholder="123" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="label">Name on Card</label>
                                    <input type="text" className="input" placeholder="JOHN DOE" />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'upi' && (
                            <div className="payment-form animate-fade-in">
                                <div className="mt-4">
                                    <label className="label">UPI ID</label>
                                    <input type="text" className="input" placeholder="username@bank" />
                                </div>
                                <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                                    A payment request will be sent to your UPI app.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Order Summary */}
                <div className="checkout-summary-container">
                    <div className="card checkout-summary">
                        <h3 className="heading-3 mb-4 border-bottom">Order Summary</h3>

                        <div className="summary-items">
                            {cart.map(item => (
                                <div key={item.id} className="summary-item">
                                    <img src={item.image} alt={item.name} className="summary-item-img" />
                                    <div className="summary-item-info">
                                        <h4 className="summary-item-name">{item.name}</h4>
                                        <span className="summary-item-qty">Qty: {item.quantity}</span>
                                    </div>
                                    <div className="summary-item-price">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>₹{getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-checkout"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing Payment...' : `Pay ₹${getCartTotal().toFixed(2)}`}
                        </button>
                        <p className="text-center text-muted mt-4" style={{ fontSize: '0.8rem' }}>
                            Your payment information is handled securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
