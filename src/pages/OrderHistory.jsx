import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const orders = useMemo(() => {
        if (!user) return [];
        const allOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
        return allOrders
            .filter(orderEntry => orderEntry[0] === user.email)
            .map(orderEntry => orderEntry[1]);
    }, [user]);

    if (!user) return null;

    return (
        <div className="container section animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h1 className="heading-1">Order History</h1>
                <Link to="/categories" className="btn btn-outline">
                    Continue Shopping
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="card text-center" style={{ padding: '4rem 2rem' }}>
                    <Package size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem' }} />
                    <h3 className="heading-3 mb-2">No orders found</h3>
                    <p className="text-muted mb-6">You haven't placed any orders with us yet.</p>
                    <Link to="/categories" className="btn btn-primary">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order, index) => (
                        <div key={index} className="card order-card">

                            {/* Order Header */}
                            <div className="order-header">
                                <div>
                                    <span className="order-id">Order {order.id}</span>
                                    <div className="flex items-center gap-2 mt-1 text-muted" style={{ fontSize: '0.9rem' }}>
                                        <Calendar size={14} />
                                        <span>{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="order-status processing">{order.status}</div>
                                    <div className="order-total mt-1">₹{order.total.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Order Items Summary visually */}
                            <div className="order-items-preview">
                                {order.items.slice(0, 3).map((item, i) => (
                                    <div key={i} className="order-preview-img-wrapper" title={`${item.name} x${item.quantity}`}>
                                        <img src={item.image} alt={item.name} className="order-preview-img" />
                                        <span className="order-preview-qty">{item.quantity}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <div className="order-preview-more">
                                        +{order.items.length - 3}
                                    </div>
                                )}
                            </div>

                            {/* Order Footer */}
                            <div className="order-footer">
                                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                                    <CreditCard size={16} /> Paid via {order.paymentMethod === 'card' ? 'Credit Card' : 'UPI'}
                                </div>
                                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    View Details
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
