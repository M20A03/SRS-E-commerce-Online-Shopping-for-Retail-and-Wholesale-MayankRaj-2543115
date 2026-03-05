import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories, products } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import './Categories.css';

const Categories = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const activeCategory = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('cat') || 'all';
    }, [location.search]);

    const filteredProducts = useMemo(() => {
        if (activeCategory === 'all') {
            return products;
        }
        return products.filter(p => p.category === activeCategory);
    }, [activeCategory]);

    const handleCategoryClick = (catId) => {
        if (catId === 'all') {
            navigate('/categories');
        } else {
            navigate(`/categories?cat=${catId}`);
        }
    };

    return (
        <div className="container section animate-fade-in">

            {/* Page Header */}
            <div className="categories-header">
                <h1 className="heading-1">Our Collections</h1>
                <p className="text-muted" style={{ marginTop: '1rem', maxWidth: '600px' }}>
                    Explore our premium range of top-tier products carefully selected for you.
                </p>
            </div>

            <div className="categories-layout">

                {/* Sidebar Filters */}
                <aside className="categories-sidebar">
                    <h3 className="sidebar-title">Categories</h3>
                    <ul className="category-list">
                        <li>
                            <button
                                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                                onClick={() => handleCategoryClick('all')}
                            >
                                All Products
                            </button>
                        </li>
                        {categories.map(cat => (
                            <li key={cat.id}>
                                <button
                                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Product Grid */}
                <main className="categories-main">

                    <div className="categories-results-bar">
                        <span>Showing <strong>{filteredProducts.length}</strong> results</span>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="text-muted">No products found in this category.</p>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default Categories;
