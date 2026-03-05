import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="container section flex-col items-center justify-center animate-fade-in" style={{ minHeight: '60vh', textAlign: 'center' }}>
                <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', marginBottom: '2rem' }}>
                    <ShoppingBag size={64} color="var(--text-secondary)" />
                </div>
                <h2 className="heading-2 mb-4">Your cart is empty</h2>
                <p className="text-muted mb-6">Looks like you haven't added any premium items to your cart yet.</p>
                <Link to="/categories" className="btn btn-primary">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container section animate-fade-in">
            <h1 className="heading-1 mb-8">Shopping Cart</h1>

            <div className="cart-layout">
                <div className="cart-items-container">
                    <div className="card">

                        {/* Header Row */}
                        <div className="cart-header grid grid-cols-12 gap-4">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {/* Cart Items */}
                        <div className="cart-items">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item grid grid-cols-12 gap-4 items-center">

                                    {/* Product Info */}
                                    <div className="col-span-6 flex gap-4 items-center">
                                        <img src={item.image} alt={item.name} className="cart-item-img" />
                                        <div>
                                            <h4 className="cart-item-name"><Link to={`/categories?cat=${item.category}`}>{item.name}</Link></h4>
                                            <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-2 text-center font-medium">
                                        ₹{item.price.toFixed(2)}
                                    </div>

                                    {/* Quantity Control */}
                                    <div className="col-span-2 flex justify-center">
                                        <div className="quantity-control">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                <Minus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Total */}
                                    <div className="col-span-2 text-right font-bold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>

                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Cart Summary */}
                <div className="cart-summary-container">
                    <div className="card cart-summary">
                        <h3 className="heading-3 mb-4 border-bottom">Order Summary</h3>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Estimated Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>₹{getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-checkout mt-6" onClick={() => navigate('/checkout')}>
                            Proceed to Checkout <ArrowRight size={18} />
                        </button>

                        <div className="mt-4 text-center">
                            <Link to="/categories" className="text-muted" style={{ fontSize: '0.9rem', textDecoration: 'underline' }}>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;
