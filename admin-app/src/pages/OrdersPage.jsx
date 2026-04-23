import { useMemo, useState } from 'react';

export default function OrdersPage({
  error,
  status,
  orders,
  ordersLoading,
  loadOrders,
  updateOrderStatus
}) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const visibleOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return orders.filter((item) => {
      const statusMatch = statusFilter === 'all' || (item.status || '').toLowerCase() === statusFilter;
      if (!statusMatch) {
        return false;
      }

      const paymentMatch = paymentFilter === 'all'
        || (paymentFilter === 'cod' && (item.paymentMethod || '').toLowerCase() === 'cod')
        || (paymentFilter === 'online' && (item.paymentMethod || '').toLowerCase() !== 'cod')
        || (paymentFilter === 'paid' && (item.paymentStatus || '').toLowerCase().includes('paid'))
        || (paymentFilter === 'pending' && (item.paymentStatus || '').toLowerCase().includes('pending'));

      if (!paymentMatch) {
        return false;
      }

      if (!q) {
        return true;
      }

      const haystack = [
        item.id,
        item.customer?.firstName,
        item.customer?.lastName,
        item.customer?.email,
        item.customer?.contact,
        item.paymentMethod,
        item.status
      ].join(' ').toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, searchText, statusFilter, paymentFilter]);

  return (
    <section className="card">
      <div className="row-title">
        <h2>Manage Orders</h2>
        <div className="row-title-actions">
          <input
            className="search-input"
            type="search"
            placeholder="Search order, customer, email"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <select
            className="status-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="status-select"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="all">All payments</option>
            <option value="cod">Cash on Delivery</option>
            <option value="online">Online</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <button className="btn btn-soft" type="button" onClick={loadOrders} disabled={ordersLoading}>
            {ordersLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {status && <p className="muted">{status}</p>}
      {error && <p className="error">{error}</p>}

      <div className="list">
        {visibleOrders.length === 0 ? (
          <p className="muted">No orders found.</p>
        ) : (
          visibleOrders.map((order) => (
            <div className="order-item" key={order.id}>
              <div className="order-header">
                <div>
                  <p><strong>Order {order.id}</strong></p>
                  <p className="muted">
                    Customer: {order.customer?.firstName} {order.customer?.lastName} | Email: {order.customer?.email}
                  </p>
                  <p className="muted">
                    Phone: {order.customer?.contact} | Total: Rs {Number(order.total || 0).toFixed(2)}
                  </p>
                  <p className="muted">Date: {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="order-status">
                  <p className="muted">
                    Payment: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase()}</strong>
                  </p>
                  <p className="muted">Status: <strong>{order.status}</strong></p>
                </div>
              </div>

              <div className="order-details">
                <p className="muted"><strong>Items ({order.items?.length || 0}):</strong></p>
                <div className="items-list">
                  {order.items?.map((item, idx) => (
                    <span key={idx} className="item-tag">
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-actions">
                <select 
                  value={order.status || 'Pending'} 
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
