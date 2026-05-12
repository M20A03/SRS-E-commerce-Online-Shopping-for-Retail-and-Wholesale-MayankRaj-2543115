import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './CartDrawer.css';

const MotionDiv = motion.div;

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    isOpen && (
      <>
        <div className="cart-drawer-backdrop" onClick={onClose} />

        <aside className="cart-drawer glass-drawer">
            <header className="cart-drawer__header">
              <div>
                <h2 className="cart-drawer__title">Your cart</h2>
                <p className="cart-drawer__subtitle">{cart.length} item{cart.length === 1 ? '' : 's'} ready for checkout</p>
              </div>
              <button type="button" className="magnetic-button magnetic-button--soft" onClick={onClose} aria-label="Close cart drawer">
                Close
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="cart-drawer__empty">
                <div className="cart-drawer__empty-icon">
                  Cart
                </div>
                <div>
                  <h3 className="section-title" style={{ fontSize: '1.5rem' }}>Your cart is empty</h3>
                  <p className="section-subtitle">Add some oils, teas, or detergent and they will appear here immediately.</p>
                </div>
                <Link to="/categories" className="glass-button glass-button--primary" onClick={onClose}>
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="cart-drawer__items">
                {cart.map((item, index) => (
                  <MotionDiv
                    key={item.id}
                    className="cart-drawer__item"
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 + 0.1, duration: 0.3, ease: 'easeOut' }}
                  >
                    <img src={item.image} alt={item.name} className="cart-drawer__thumb" loading="lazy" />
                    <div className="cart-drawer__item-body">
                      <div className="cart-drawer__item-top">
                        <div>
                          <h3 className="cart-drawer__item-title">{item.name}</h3>
                          <p className="cart-drawer__item-price">₹{item.price.toFixed(2)}</p>
                        </div>
                        <button type="button" className="cart-drawer__remove" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </button>
                      </div>

                      <div className="cart-drawer__controls">
                        <div className="cart-drawer__stepper">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <footer className="cart-drawer__summary">
                <div className="cart-drawer__summary-row">
                  <span className="cart-drawer__summary-label">Subtotal</span>
                  <strong>₹{getCartTotal().toFixed(2)}</strong>
                </div>
                <div className="cart-drawer__summary-row">
                  <span className="cart-drawer__summary-label">Shipping</span>
                  <strong>Free</strong>
                </div>
                <div className="cart-drawer__summary-row">
                  <span className="cart-drawer__summary-label">Total</span>
                  <strong className="cart-drawer__summary-total">₹{getCartTotal().toFixed(2)}</strong>
                </div>
                <div className="cart-drawer__actions">
                  <Link to="/cart" className="glass-button glass-button--soft" onClick={onClose}>
                    View cart
                  </Link>
                  <button
                    type="button"
                    className="glass-button glass-button--primary"
                    onClick={() => {
                      onClose();
                      if (!user) {
                        addToast('Please create an account before checkout.', 'info');
                        navigate('/account', { state: { from: '/checkout', prompt: 'Please create an account to continue checkout.' } });
                        return;
                      }
                      navigate('/checkout');
                    }}
                  >
                    Checkout
                  </button>
                </div>
              </footer>
            )}
        </aside>
      </>
    )
  );
};

export default CartDrawer;
