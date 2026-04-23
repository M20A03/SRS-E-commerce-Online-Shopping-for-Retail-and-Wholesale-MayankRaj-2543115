import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Sparkles, TriangleAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, onQuickView, onAddToCartFly }) => {
    const { addToCart } = useCart();
    const cardRef = useRef(null);
    const actionButtonRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const MotionArticle = motion.article;

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
        addToCart(product);
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
        <MotionArticle
            ref={cardRef}
            className="product-card glass-card glass-card--interactive"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
            <div className="product-card__visual">
                <div className={`product-card__stock ${isLowStock ? 'product-card__stock--warning' : ''}`}>
                    <Sparkles size={14} />
                    <span>{stock > 1 ? `${stock} in stock` : 'Last piece'}</span>
                </div>

                <div className="product-card__image-shell">
                    {!imageLoaded && <div className="skeleton product-card__skeleton" />}
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`product-card__image ${imageLoaded ? 'is-loaded' : ''}`}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setImageLoaded(true)}
                    />
                    <div className="product-card__hover-panel">
                        <button type="button" className="magnetic-button magnetic-button--soft" onClick={() => onQuickView?.(product)}>
                            <Eye size={16} /> Quick view
                        </button>
                    </div>
                </div>
            </div>

            <div className="product-card__content">
                <div className="product-card__meta">
                    <span className="glass-chip">{product.category}</span>
                    {isLowStock && (
                        <span className="product-card__warning">
                            <TriangleAlert size={14} /> Only {stock} left
                        </span>
                    )}
                </div>

                <h3 className="product-card__title">{product.name}</h3>
                <p className="product-card__description">{product.description}</p>

                <div className="product-card__footer">
                    <div>
                        <p className="product-card__price">₹{product.price.toFixed(2)}</p>
                        <p className="product-card__subtext">Free delivery eligible</p>
                    </div>

                    <button
                        ref={actionButtonRef}
                        type="button"
                        className="magnetic-button magnetic-button--primary product-card__add"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={16} />
                        Add to cart
                    </button>
                </div>
            </div>
        </MotionArticle>
    );
};

export default ProductCard;
