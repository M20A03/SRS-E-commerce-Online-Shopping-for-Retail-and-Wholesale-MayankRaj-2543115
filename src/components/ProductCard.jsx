import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ProductCard.css';

const ProductCard = ({ product, onQuickView, onAddToCartFly }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const cardRef = useRef(null);
    const actionButtonRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const stock = useMemo(() => {
        if (typeof product.stock === 'number') {
            return product.stock;
        }

        const baseValue = product.id.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
        return (baseValue % 12) + 1;
    }, [product]);

    const isLowStock = stock <= 3;

    const handleAddToCart = (e) => {
        e.preventDefault();
        console.log('🛒 ProductCard - handleAddToCart called', { product: product.id, user: user?.email || 'NOT LOGGED IN' });
        
        // Check if user is logged in
        if (!user) {
            console.log('❌ No user logged in, redirecting to register');
            addToast('Sign in to add items to your cart.', 'info');
            // Redirect to signup page
            navigate('/account', { state: { from: '/checkout', product: product.id, prompt: 'Please create an account to continue shopping.' } });
            return;
        }
        
        console.log('✅ User logged in, adding to cart:', product.id);
        addToCart(product);
        addToast(`${product.name} added to your cart.`, 'success');
        console.log('✅ Added to cart, calling onAddToCartFly');
        if (typeof onAddToCartFly === 'function') {
            onAddToCartFly(product, actionButtonRef.current?.getBoundingClientRect());
        }
    };

    const handleMouseMove = (event) => {
        if (window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const card = cardRef.current;
        if (!card) {
            return;
        }

        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 12;
        const rotateX = (0.5 - y) * 12;

        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
        card.style.setProperty('--shine-x', `${Math.round(x * 100)}%`);
        card.style.setProperty('--shine-y', `${Math.round(y * 100)}%`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) {
            return;
        }

        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--shine-x', '50%');
        card.style.setProperty('--shine-y', '50%');
    };

    return (
        <article
            ref={cardRef}
            className="product-card glass-card glass-card--interactive"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="product-card__visual">
                <div className={`product-card__stock ${isLowStock ? 'product-card__stock--warning' : ''}`}>
                    <span>{stock > 1 ? `${stock} in stock` : 'Last piece'}</span>
                </div>

                <div className="product-card__image-shell">
                    {!imageLoaded && <div className="skeleton product-card__skeleton" />}
                    {(() => {
                        const imgs = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);
                        const src = imgs[currentIndex] || '';
                        return (
                            <>
                                <img
                                    src={src}
                                    alt={product.name}
                                    className={`product-card__image ${imageLoaded ? 'is-loaded' : ''}`}
                                    loading="lazy"
                                    decoding="async"
                                    onLoad={() => setImageLoaded(true)}
                                />
                                {imgs.length > 1 && (
                                    <>
                                        <div className="product-card__carousel-controls">
                                            <button type="button" className="carousel-btn carousel-btn--prev" onClick={() => setCurrentIndex((i) => (i - 1 + imgs.length) % imgs.length)} aria-label="Previous image">‹</button>
                                            <button type="button" className="carousel-btn carousel-btn--next" onClick={() => setCurrentIndex((i) => (i + 1) % imgs.length)} aria-label="Next image">›</button>
                                        </div>
                                        <div className="product-card__image-indicators">
                                            {imgs.map((_, i) => (
                                                <div key={i} className={`image-indicator ${i === currentIndex ? 'active' : ''}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                    <div className="product-card__hover-panel">
                        <button type="button" className="magnetic-button magnetic-button--soft" onClick={() => onQuickView?.(product)}>
                            Quick view
                        </button>
                    </div>
                </div>
            </div>

            <div className="product-card__content">
                <div className="product-card__meta">
                    <span className="glass-chip">{product.category}</span>
                    {isLowStock && (
                        <span className="product-card__warning">
                            Only {stock} left
                        </span>
                    )}
                </div>

                <h3 className="product-card__title">{product.name}</h3>
                <p className="product-card__description">{product.description}</p>

                <div className="product-card__footer">
                    <div>
                        <p className="product-card__price" style={{ color: '#000', fontWeight: '800' }}>₹{product.price.toFixed(2)}</p>
                        <p className="product-card__subtext">Free delivery eligible</p>
                    </div>

                    <button
                        ref={actionButtonRef}
                        type="button"
                        className="magnetic-button magnetic-button--primary product-card__add"
                        onClick={handleAddToCart}
                    >
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
