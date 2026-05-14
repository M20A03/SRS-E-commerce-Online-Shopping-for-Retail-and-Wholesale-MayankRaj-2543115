import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useReveal } from '../hooks/useReveal';

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const revealRef = useReveal();
  const cardRef = useRef(null);
  
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const isWishlisted = isInWishlist(product.id);

  const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 ? '☆' : '');

  return (
    <div
      ref={(el) => {
        revealRef.current = el;
        cardRef.current = el;
      }}
      className="product-card reveal"
      style={{ 
        transitionDelay: `${delay}s`,
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 50, y: 50 }); }}
      onMouseMove={handleMouseMove}
      onClick={() => navigate(`/products/${product.id}`)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/products/${product.id}`);
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
    >
      <div className={`product-glow ${isHovered ? 'active' : ''}`} />
      <div className="product-img-wrap">
        {product.badge && (
          <span className={`product-label ${product.badgeType}`}>{product.badge}</span>
        )}
        <img src={product.image} alt={product.name} loading="lazy" />
        <button
          className={`product-wishlist ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button
          className="product-quick-add"
          onClick={e => { e.stopPropagation(); addToCart(product); }}
        >
          + Add to Cart
        </button>
      </div>
      <div className="product-info">
        <p className="product-brand">{product.brand}</p>
        <h4 className="product-name">{product.name}</h4>
        <div className="product-rating">
          <span className="stars">{stars}</span>
          <span>({product.reviews.toLocaleString()} reviews)</span>
        </div>
        <div className="product-price">
          <span className="price-current">₹{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <>
              <span className="price-original">₹{product.originalPrice.toFixed(2)}</span>
              <span className="price-badge">SAVE {Math.round((1 - product.price/product.originalPrice)*100)}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
