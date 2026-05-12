import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Star } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product, onQuickView, onAddToCartFly }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const cardRef = useRef(null);
    const actionButtonRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Dynamic mock variants based on category
    const mockVariants = useMemo(() => {
        if (product.category === 'oil') return ['500ml', '1L', '5L'];
        if (product.category === 'tea') return ['250g', '500g', '1kg'];
        if (product.category === 'detergent') return ['500g', '1kg', '3kg'];
        return ['1 Unit', 'Pack of 3'];
    }, [product.category]);

    const isWishlisted = isInWishlist(product.id);

    const rating = useMemo(() => {
        // Generate a stable random rating for demo purposes
        const base = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (3.5 + (base % 15) / 10).toFixed(1);
    }, [product.id]);

    const reviewCount = useMemo(() => {
        const base = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (base % 500) + 50;
    }, [product.id]);

    const stock = useMemo(() => {
        if (typeof product.stock === 'number') {
            return product.stock;
        }

        const baseValue = product.id.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
        return (baseValue % 12) + 1;
    }, [product]);

    const isLowStock = stock <= 3;

    const handleAddToCart = (e, variant = null) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            addToast('Sign in to add items to your cart.', 'info');
            navigate('/account', { state: { from: '/checkout', product: product.id, prompt: 'Please create an account to continue shopping.' } });
            return;
        }
        
        const productToAdd = variant ? {
            ...product,
            id: `${product.id}-${variant.replace(/\s+/g, '-').toLowerCase()}`,
            name: `${product.name} (${variant})`
        } : product;

        addToCart(productToAdd);
        addToast(`${productToAdd.name} added to your cart.`, 'success');
        if (typeof onAddToCartFly === 'function') {
            onAddToCartFly(productToAdd, actionButtonRef.current?.getBoundingClientRect());
        }
    };

    return (
        <article
            ref={cardRef}
            className="product-card glass-card glass-card--interactive"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-card__visual">
                <div className={`product-card__stock ${isLowStock ? 'product-card__stock--warning' : ''}`}>
                    <span>{stock > 1 ? `${stock} in stock` : 'Last piece'}</span>
                </div>

                <button 
                    className={`product-card__wishlist ${isWishlisted ? 'is-active' : ''}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                    aria-label="Add to wishlist"
                >
                    <Heart size={18} fill={isWishlisted ? "var(--error-color)" : "transparent"} stroke={isWishlisted ? "var(--error-color)" : "currentColor"} />
                </button>

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
                    <div className="product-card__rating">
                        <Star size={12} fill="var(--accent-3)" stroke="var(--accent-3)" />
                        <span>{rating} ({reviewCount})</span>
                    </div>
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
                        <p className="product-card__price">₹{product.price.toFixed(2)}</p>
                    </div>

                    <div className="product-card__quick-add-container" ref={actionButtonRef}>
                        <button
                            type="button"
                            className="magnetic-button magnetic-button--primary product-card__add"
                            onClick={(e) => handleAddToCart(e)}
                        >
                            Add to cart
                        </button>

                        <div className={`product-card__variant-selector ${isHovered ? 'is-visible' : ''}`}>
                            <p className="variant-title">Quick Add:</p>
                            <div className="variant-options">
                                {mockVariants.map(variant => (
                                    <button 
                                        key={variant} 
                                        className="variant-btn"
                                        onClick={(e) => handleAddToCart(e, variant)}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
