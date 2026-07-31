// IMPROVEMENT: High-performance, pixel-perfect responsive Categories page for Phone, Tablet, and Desktop
import React, { useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import useDebounce from '../hooks/useDebounce';
import SEO from '../components/SEO';
import './Categories.css';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const visibleProducts = useMemo(() => {
    const queryStr = debouncedSearchTerm.trim().toLowerCase();
    let next = filteredProducts.filter((product) => {
      if (!queryStr) return true;
      const text = `${product.name} ${product.description || ''} ${product.category || ''} ${product.brand || ''}`.toLowerCase();
      return text.includes(queryStr);
    });

    if (sortBy === 'price-low') {
      next = [...next].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      next = [...next].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name') {
      next = [...next].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      next = [...next].sort((a, b) => Number(b.featured || 0) - Number(a.featured || 0));
    }

    return next;
  }, [filteredProducts, debouncedSearchTerm, sortBy]);

  const handleCategoryClick = useCallback((catId) => {
    if (catId === 'all') {
      navigate('/categories');
    } else {
      navigate(`/categories?cat=${catId}`);
    }
  }, [navigate]);

  const activeCategoryLabel = activeCategory === 'all' ? 'All Collections' : categories.find((c) => c.id === activeCategory)?.name || activeCategory;

  return (
    <div className="categories-container animate-fade-in">
      <SEO
        title={`${activeCategoryLabel} | Roshan Enterprises Dhanbad`}
        description={`Shop ${activeCategoryLabel} online at Roshan Enterprises. Find high quality mustard oil, sunflower oil, Assam tea, and household supplies in Dhanbad.`}
        canonicalPath={`/categories${activeCategory !== 'all' ? `?cat=${activeCategory}` : ''}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://e-commerce-roshan-enterprises-dhn.web.app/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Categories',
              item: 'https://e-commerce-roshan-enterprises-dhn.web.app/categories'
            }
          ]
        }}
      />
      {/* Page Header */}
      <div className="categories-header">
        <h1 className="heading-1">Our Collections</h1>
        <p className="categories-subtitle">
          Explore our premium range of cooking oils, teas, and household essentials carefully selected for you.
        </p>
      </div>

      <div className="categories-layout">
        {/* Sidebar Filters (Sticky on desktop, horizontal scrollable pills on mobile) */}
        <aside className="categories-sidebar">
          <h3 className="sidebar-title">Categories</h3>
          <ul className="category-list">
            <li>
              <button
                type="button"
                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('all')}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Products Container */}
        <main className="categories-main">
          <div className="categories-results-bar">
            <span className="results-count">Showing <strong>{visibleProducts.length}</strong> products</span>
            <div className="categories-controls">
              <input
                type="search"
                className="input categories-search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <select
                className="input categories-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <p className="text-muted">Loading products...</p>
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="categories-products-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="text-muted">No products found matching your search criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default React.memo(Categories);
