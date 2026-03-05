import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault(); // Prevent navigating to product details if clicked inside a Link
        addToCart(product);
    };

    return (
        <div className="product-card card">
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                <div className="product-overlay">
                    <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                        <ShoppingCart size={18} /> Add to Cart
                    </button>
                </div>
            </div>

            <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default ProductCard;
