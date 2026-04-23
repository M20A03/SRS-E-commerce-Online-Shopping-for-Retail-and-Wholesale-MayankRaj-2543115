import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const MotionDiv = motion.div;
  const MotionAside = motion.aside;

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
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            className="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <MotionAside
            className="cart-drawer glass-drawer"
            initial={{ x: '110%' }}
            animate={{ x: 0 }}
            exit={{ x: '110%' }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          >
            <header className="cart-drawer__header">
              <div>
                <h2 className="cart-drawer__title">Your cart</h2>
                <p className="cart-drawer__subtitle">{cart.length} item{cart.length === 1 ? '' : 's'} ready for checkout</p>
              </div>
              <button type="button" className="magnetic-button magnetic-button--soft" onClick={onClose} aria-label="Close cart drawer">
                <X size={18} />
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="cart-drawer__empty">
                <div className="cart-drawer__empty-icon">
                  <ShoppingBag size={30} />
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
                {cart.map((item) => (
                  <MotionDiv
                    key={item.id}
                    className="cart-drawer__item"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
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
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus size={14} />
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
                  <Link to="/checkout" className="glass-button glass-button--primary" onClick={onClose}>
                    Checkout <ArrowRight size={16} />
                  </Link>
                </div>
              </footer>
            )}
          </MotionAside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
