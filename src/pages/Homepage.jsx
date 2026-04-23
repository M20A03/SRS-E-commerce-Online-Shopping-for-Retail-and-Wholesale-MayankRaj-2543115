import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Search, ShieldCheck, Truck, Store, X, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import './Homepage.css';

/* ─── RevealSection ─── */
const RevealSection = ({ children, className = '', delay = 0.1 }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
};

/* ─── Hero Slider (Professional) ─── */
const HeroSlider = ({ products, onAddToCart }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (products.length < 2) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  if (!products.length) return null;

  return (
    <div className="hero-slider">
      <div className="hero-slider__stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-slider__slide"
          >
            <div className="hero-slider__image-wrap">
              <img src={products[active].image} alt={products[active].name} className="hero-slider__image" />
            </div>
            <div className="hero-slider__content card">
              <span className="hero-slider__category">{products[active].category}</span>
              <h3 className="hero-slider__title">{products[active].name}</h3>
              <div className="hero-slider__footer">
                <span className="hero-slider__price">₹{products[active].price?.toFixed(2)}</span>
                <button type="button" className="btn btn-primary" onClick={() => onAddToCart(products[active])}>
                  <Zap size={14} /> Add
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hero-slider__dots">
        {products.map((_, i) => (
          <button
            key={i}
            className={`hero-slider__dot ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Main Homepage ─── */
const Homepage = ({ onOpenCart }) => {
  const { addToCart } = useCart();
  const { products, categories, isLoading: isProductsLoading } = useProducts();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const homepageProducts = useMemo(() => {
    return products.filter((p) => ['oil', 'tea', 'detergent', 'others'].includes(p.category));
  }, [products]);

  const featuredProducts = useMemo(() => homepageProducts.filter((p) => p.featured).slice(0, 4), [homepageProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const visibleProducts = useMemo(() => {
    return homepageProducts.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      const matchSearch = !searchQuery || text.includes(searchQuery);
      return matchCat && matchSearch;
    }).slice(0, 12);
  }, [activeCategory, searchQuery, homepageProducts]);

  return (
    <div className="homepage">
      {/* ── Hero Section ── */}
      <section className="homepage__hero section">
        <div className="container">
          <div className="homepage__hero-grid">
            <div className="homepage__hero-copy">
              <h1 className="heading-1">Premium quality<br />everyday essentials</h1>
              <p className="text-muted homepage__subtitle">
                Shop cooking oils, tea, and household essentials with reliable quality and sophisticated doorstep delivery from Roshan Enterprises.
              </p>
              <div className="flex gap-4">
                <Link to="/categories" className="btn btn-primary">
                  Shop collection
                </Link>
                <button onClick={onOpenCart} className="btn btn-outline">
                  View cart <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="homepage__hero-visual">
              <HeroSlider products={featuredProducts.length > 0 ? featuredProducts : homepageProducts.slice(0, 4)} onAddToCart={addToCart} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Promos ── */}
      <RevealSection className="section" delay={0}>
        <div className="container">
          <div className="homepage__promos">
            <div className="homepage__promo card">
              <Truck size={24} className="homepage__promo-icon" />
              <h3 className="heading-3">Fast Delivery</h3>
              <p className="text-muted">Complimentary shipping on qualifying orders.</p>
            </div>
            <div className="homepage__promo card">
              <ShieldCheck size={24} className="homepage__promo-icon" />
              <h3 className="heading-3">Secure Checkout</h3>
              <p className="text-muted">100% protected and safe transactions.</p>
            </div>
            <div className="homepage__promo card">
              <Store size={24} className="homepage__promo-icon" />
              <h3 className="heading-3">Premium Quality</h3>
              <p className="text-muted">Sourced from the finest local suppliers.</p>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── Products Section ── */}
      <RevealSection className="section homepage__products">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 homepage__products-header">
            <h2 className="heading-2">Curated Collection</h2>
            <p className="text-muted">Discover our selection of premium household products.</p>
          </div>

          <div className="homepage__toolbar">
            <div className="homepage__search card">
              <Search size={18} className="text-muted" />
              <input
                type="search"
                className="homepage__search-input"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="homepage__filters">
              <button
                className={`homepage__filter ${activeCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`homepage__filter ${activeCategory === cat.id ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-4 gap-8">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                  onAddToCartFly={addToCart}
                />
              ))}
            </div>
          ) : (
             <div className="text-center section text-muted">
               <h3 className="heading-3">No products found</h3>
               <p>Try adjusting your search or filters.</p>
             </div>
          )}
        </div>
      </RevealSection>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="quickview-backdrop" onClick={() => setQuickViewProduct(null)}>
            <motion.div
              className="quickview-modal card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="quickview-close" onClick={() => setQuickViewProduct(null)}>
                <X size={20} />
              </button>
              <div className="quickview-grid">
                <div className="quickview-image-wrap">
                  <img src={quickViewProduct.image} alt={quickViewProduct.name} className="quickview-image" />
                </div>
                <div className="quickview-content">
                  <span className="quickview-category">{quickViewProduct.category}</span>
                  <h2 className="heading-2">{quickViewProduct.name}</h2>
                  <p className="text-muted quickview-desc">{quickViewProduct.description}</p>
                  <p className="quickview-price heading-1">₹{quickViewProduct.price?.toFixed(2)}</p>
                  <button className="btn btn-primary w-full" onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Homepage;
