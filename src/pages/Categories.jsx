// IMPROVEMENT: Memoized Categories page using custom useDebounce hook and react-window virtualization when list > 50 items
import React, { useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import useDebounce from '../hooks/useDebounce';
import './Categories.css';

const VirtualizedProductGrid = ({ products }) => {
  // 3 items per row grid virtualized for long product lists (> 50 items)
  const itemsPerRow = 3;
  const rowCount = Math.ceil(products.length / itemsPerRow);

  const Row = ({ index, style }) => {
    const startIdx = index * itemsPerRow;
    const rowProducts = products.slice(startIdx, startIdx + itemsPerRow);

    return (
      <div style={{ ...style, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {rowProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <List
      height={800}
      itemCount={rowCount}
      itemSize={420}
      width="100%"
    >
      {Row}
    </List>
  );
};

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

  return (
    <div className="container section animate-fade-in">
      {/* Page Header */}
      <div className="categories-header">
        <h1 className="heading-1">Our Collections</h1>
        <p className="text-muted" style={{ marginTop: '1rem', maxWidth: '600px' }}>
          Explore our premium range of cooking oils, teas, and household essentials carefully selected for you.
        </p>
      </div>

      <div className="categories-layout">
        {/* Sidebar Filters */}
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

        {/* Product Grid */}
        <main className="categories-main">
          <div className="categories-results-bar">
            <span>Showing <strong>{visibleProducts.length}</strong> products</span>
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
          ) : visibleProducts.length > 50 ? (
            <VirtualizedProductGrid products={visibleProducts} />
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 products-grid">
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
