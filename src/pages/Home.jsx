import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    const featuredProducts = useMemo(() => {
        return products.filter(p => p.featured).slice(0, 4);
    }, []);

    return (
        <div className="home-page animate-fade-in">

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background"></div>
                <div className="container hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">Premium Collection 2026</span>
                        <h1 className="hero-title">Elevate Your Lifestyle</h1>
                        <p className="hero-subtitle">
                            Discover premium cooking oils, aromatic teas, and everyday household essentials delivered to you.
                        </p>
                        <div className="hero-actions">
                            <Link to="/categories" className="btn btn-primary hero-btn">
                                Shop Now <ArrowRight size={20} />
                            </Link>
                            <Link to="/categories?cat=oil" className="btn btn-outline hero-btn">
                                Explore Oils
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Banner */}
            <section className="features-banner">
                <div className="container features-grid">
                    <div className="feature-item">
                        <Truck className="feature-icon" />
                        <div>
                            <h4 className="feature-title">Free Shipping</h4>
                            <p className="feature-desc">On all orders over ₹500</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <Shield className="feature-icon" />
                        <div>
                            <h4 className="feature-title">Secure Payment</h4>
                            <p className="feature-desc">100% secure checkout</p>
                        </div>
                    </div>
                    <div className="feature-item">
                        <Star className="feature-icon" />
                        <div>
                            <h4 className="feature-title">Premium Quality</h4>
                            <p className="feature-desc">Authentic top-tier brands</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Category Cards */}
            <section className="section categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="heading-2">Shop by Category</h2>
                        <Link to="/categories" className="view-all-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="category-cards-grid">
                        <Link to="/categories?cat=oil" className="cat-card">
                            <img src="https://images.unsplash.com/photo-1620584400589-424a683935dc?w=800&q=80" alt="Cooking Oil" className="cat-card-img" />
                            <div className="cat-card-content">
                                <h3>Cooking Oils</h3>
                                <p>Premium & Refined</p>
                            </div>
                        </Link>
                        <Link to="/categories?cat=tea" className="cat-card">
                            <img src="https://images.unsplash.com/photo-1594910300957-61c0e3a62886?w=800&q=80" alt="Tea" className="cat-card-img" />
                            <div className="cat-card-content">
                                <h3>Aromatic Teas</h3>
                                <p>Fresh from Assam</p>
                            </div>
                        </Link>
                        <Link to="/categories?cat=detergent" className="cat-card">
                            <img src="https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80" alt="Detergents" className="cat-card-img" />
                            <div className="cat-card-content">
                                <h3>Detergents</h3>
                                <p>Tough on Stains</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="heading-2">Trending Now</h2>
                        <Link to="/categories" className="view-all-link">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-4 gap-4 products-grid">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Showcase (Promotional Banner) */}
            <section className="promo-section container section">
                <div className="promo-card">
                    <div className="promo-content">
                        <span className="promo-tag">New Arrivals</span>
                        <h3 className="promo-title">Premium Assam Tea</h3>
                        <p className="promo-desc">Refresh your mornings with the robust flavor of Meri Chai Akshay.</p>
                        <Link to="/categories?cat=tea" className="btn btn-primary">
                            Discover Tea
                        </Link>
                    </div>
                    <div className="promo-image-wrapper">
                        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?w=800&q=80" alt="Spring Collection" className="promo-img" />
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="container newsletter-container">
                    <div className="newsletter-content">
                        <h2>Join Our Newsletter</h2>
                        <p>Subscribe to get exclusive offers, daily updates on essential goods, and amazing discounts directly to your inbox.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Enter your email address" required className="newsletter-input" />
                            <button type="submit" className="btn btn-primary newsletter-btn">Subscribe Free</button>
                        </form>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
