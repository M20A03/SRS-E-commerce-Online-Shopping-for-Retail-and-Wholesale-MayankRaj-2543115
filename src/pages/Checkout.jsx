import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { CreditCard, Smartphone, HandCoins, CheckCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formError, setFormError] = useState('');
    const [customerInfo, setCustomerInfo] = useState({
        firstName: '',
        lastName: '',
        contact: '',
        email: '',
        shippingAddress: ''
    });

    const subtotal = getCartTotal();
    const shippingFee = subtotal >= 500 ? 0 : 49;
    const tax = subtotal * 0.05;
    const finalTotal = subtotal + shippingFee + tax;

    useEffect(() => {
        if (cart.length === 0 && !orderComplete) {
            navigate('/cart');
        }
    }, [cart.length, navigate, orderComplete]);

    const resolvedCustomerInfo = {
        firstName: customerInfo.firstName || user?.firstName || '',
        lastName: customerInfo.lastName || user?.lastName || '',
        contact: customerInfo.contact || user?.contact || '',
        email: customerInfo.email || user?.email || '',
        shippingAddress: customerInfo.shippingAddress || ''
    };

    const handleInfoChange = (event) => {
        const { name, value } = event.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!resolvedCustomerInfo.firstName || !resolvedCustomerInfo.lastName || !resolvedCustomerInfo.contact || !resolvedCustomerInfo.email || !resolvedCustomerInfo.shippingAddress) {
            setFormError('Please fill all required customer and shipping details.');
            return;
        }

        if (!acceptTerms) {
            setFormError('Please accept terms before placing the order.');
            return;
        }

        setIsProcessing(true);

        try {
            const isCashOnDelivery = paymentMethod === 'cod';
            const paymentStatus = isCashOnDelivery ? 'Pending (Cash on Delivery)' : 'Paid';
            const orderStatus = isCashOnDelivery ? 'Confirmed' : 'Processing';
            const now = new Date();
            const estimatedDeliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

            // Save order payload with delivery ETA
            const newOrder = {
                id: `ORD-${Math.floor(Math.random() * 1000000)}`,
                date: now.toISOString(),
                updatedAt: now.toISOString(),
                estimatedDeliveryDate,
                estimatedDeliveryDaysMin: 2,
                estimatedDeliveryDaysMax: 4,
                items: [...cart],
                subtotal,
                shippingFee,
                tax,
                total: finalTotal,
                status: orderStatus,
                paymentMethod,
                paymentStatus,
                customer: resolvedCustomerInfo
            };

            if (user?.id) {
                await addDoc(collection(db, 'orders'), {
                    ...newOrder,
                    userId: user.id,
                    userEmail: user.email || ''
                });
            } else {
                const existingOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
                const orderOwner = `guest:${resolvedCustomerInfo.email}`;
                localStorage.setItem('luxe_orders', JSON.stringify([[orderOwner, newOrder], ...existingOrders]));
            }

            setOrderComplete(true);
            clearCart();
        } catch (error) {
            setFormError(error.message || 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="container section flex-col items-center justify-center animate-fade-in" style={{ minHeight: '60vh', textAlign: 'center' }}>
                <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '2rem' }} />
                <h1 className="heading-1 mb-4">{paymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!'}</h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px' }}>
                    {paymentMethod === 'cod'
                        ? 'Your order is confirmed with Cash on Delivery. We will contact you and share shipping updates shortly.'
                        : 'Thank you for your order. We are processing it now and will email you with shipping details shortly.'}
                </p>
                {user ? (
                    <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                        View Order History
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={() => navigate('/categories')}>
                        Continue Shopping
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="container section animate-fade-in">
            <h1 className="heading-1 mb-6">Checkout</h1>
            <div className="checkout-progress card">
                <div className="checkout-progress__step is-active">1. Shipping</div>
                <div className="checkout-progress__step is-active">2. Payment</div>
                <div className="checkout-progress__step">3. Review</div>
            </div>

            <div className="checkout-layout">
                <div className="checkout-form-container">

                    {/* Shipping Form */}
                    <div className="card checkout-section">
                        <h3 className="heading-3 mb-4 border-bottom">Shipping Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">First Name</label>
                                <input type="text" className="input" name="firstName" value={resolvedCustomerInfo.firstName} onChange={handleInfoChange} />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input type="text" className="input" name="lastName" value={resolvedCustomerInfo.lastName} onChange={handleInfoChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="label">Contact Number</label>
                                <input type="text" className="input" name="contact" value={resolvedCustomerInfo.contact} onChange={handleInfoChange} />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input type="email" className="input" name="email" value={resolvedCustomerInfo.email} onChange={handleInfoChange} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="label">Shipping Address</label>
                            <textarea className="input" rows="3" name="shippingAddress" value={resolvedCustomerInfo.shippingAddress} onChange={handleInfoChange} placeholder="Enter your full shipping address..." required></textarea>
                        </div>
                        {!user && <p className="checkout-hint">Guest checkout enabled: you can place order without creating an account.</p>}
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

                            <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                <HandCoins size={24} />
                                <span>Cash on Delivery</span>
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

                        {paymentMethod === 'cod' && (
                            <div className="payment-form animate-fade-in">
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Pay in cash when your order is delivered. Please keep the exact amount ready for faster delivery.
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
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}</span>
                            </div>
                            <div className="summary-row">
                                <span>Estimated Tax (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <label className="checkout-consent">
                            <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
                            <span>I agree to terms, return policy, and shipping policy.</span>
                        </label>

                        {formError && <p className="checkout-error">{formError}</p>}

                        <button
                            className="btn btn-primary btn-checkout"
                            onClick={handleCheckout}
                            disabled={isProcessing}
                        >
                            {isProcessing
                                ? (paymentMethod === 'cod' ? 'Placing Order...' : 'Processing Payment...')
                                : (paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${finalTotal.toFixed(2)}`)}
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
