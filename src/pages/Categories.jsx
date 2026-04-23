import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import './Categories.css';

const Categories = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const { products, categories, isLoading } = useProducts();

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

    const visibleProducts = useMemo(() => {
        let next = filteredProducts.filter((product) => {
            if (!searchTerm.trim()) return true;
            const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
            return text.includes(searchTerm.trim().toLowerCase());
        });

        if (sortBy === 'price-low') {
            next = [...next].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            next = [...next].sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name') {
            next = [...next].sort((a, b) => a.name.localeCompare(b.name));
        } else {
            next = [...next].sort((a, b) => Number(b.featured) - Number(a.featured));
        }

        return next;
    }, [filteredProducts, searchTerm, sortBy]);

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
                        <span>Showing <strong>{visibleProducts.length}</strong> results</span>
                        <div className="categories-controls">
                            <input
                                type="search"
                                className="input categories-search"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                            <select className="input categories-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {visibleProducts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 products-grid">
                            {visibleProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : isLoading ? (
                        <div className="empty-state">
                            <p className="text-muted">Loading products...</p>
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
