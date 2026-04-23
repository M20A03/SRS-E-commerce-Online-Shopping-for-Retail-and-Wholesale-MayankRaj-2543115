import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import './DatabaseOrders.css';

const DatabaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const orderQuery = query(collection(db, 'orders'), where('userId', '==', user.id));
        const snapshot = await getDocs(orderQuery);
        const rows = snapshot.docs
          .map((docItem) => {
            const data = docItem.data();
            const etaDate = data.estimatedDeliveryDate
              ? new Date(data.estimatedDeliveryDate)
              : new Date(new Date(data.date).getTime() + 3 * 24 * 60 * 60 * 1000);
            const daysLeft = Math.ceil((etaDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

            return {
              ...data,
              id: data.id || docItem.id,
              etaDate,
              daysLeft
            };
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setOrders(rows);
      } catch (error) {
        console.error('Error loading database orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="container section animate-fade-in">
      <div className="database-header">
        <div>
          <h1 className="heading-1">Database Orders</h1>
          <p className="text-muted">Live records from Firestore with delivery confirmation timeline.</p>
        </div>
        <div className="database-header__actions">
          <Link to="/orders" className="btn btn-outline">Order History</Link>
          <Link to="/account" className="btn btn-primary">Account</Link>
        </div>
      </div>

      {isLoading ? (
        <div className="card database-empty">Loading database records...</div>
      ) : orders.length === 0 ? (
        <div className="card database-empty">No database orders found for this account yet.</div>
      ) : (
        <div className="database-table card">
          <div className="database-table__head">
            <span>Order ID</span>
            <span>Date</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Delivery Date</span>
            <span>Days Left</span>
          </div>

          <div className="database-table__body">
            {orders.map((order) => (
              <div key={order.id} className="database-row">
                <span className="database-row__id">{order.id}</span>
                <span>{new Date(order.date).toLocaleDateString()}</span>
                <span>Rs {Number(order.total || 0).toFixed(2)}</span>
                <span>{order.paymentMethod || 'N/A'}</span>
                <span>{order.status || 'Processing'}</span>
                <span>{order.etaDate.toLocaleDateString()}</span>
                <span>{order.daysLeft <= 0 ? 'Today' : `${order.daysLeft} days`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseOrders;
