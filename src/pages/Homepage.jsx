import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Search, ShieldCheck, Truck, Store, X, Zap, ChevronLeft, ChevronRight, Star, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import './Homepage.css';

/* ─── RevealSection ─── */
const RevealSection = ({ children, className = '', delay = 0.1 }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
};

/* ─── Hero Slider ─── */
const HeroSlider = ({ products, onAddToCart }) => {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  const goTo = (i) => {
    setDir(i > active ? 1 : -1);
    setActive(i);
  };

  useEffect(() => {
    if (products.length < 2) return;
    const interval = setInterval(() => {
      setDir(1);
      setActive((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  if (!products.length) return null;

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({ x: direction > 0 ? '-40%' : '40%', opacity: 0, scale: 0.96 }),
  };

  return (
    <div className="hero-slider">
      <div className="hero-slider__stage">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={active}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="hero-slider__slide"
          >
            <div className="hero-slider__image-wrap">
              {(() => {
                const p = products[active];
                const imgs = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
                const src = imgs[0] || '';
                return <img src={src} alt={p.name} className="hero-slider__image" loading="lazy" />;
              })()}
              <div className="hero-slider__image-shimmer" />
            </div>
            <div className="hero-slider__content glass-card--premium">
              <span className="hero-slider__category glass-chip glass-chip--accent">{products[active].category}</span>
              <h3 className="hero-slider__title">{products[active].name}</h3>
              <div className="hero-slider__footer">
                <span className="hero-slider__price">₹{products[active].price?.toFixed(2)}</span>
                <button type="button" className="btn btn-gradient" onClick={() => onAddToCart(products[active])}>
                  <Zap size={14} /> Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next arrows */}
        {products.length > 1 && (
          <>
            <button className="hero-slider__arrow hero-slider__arrow--prev" onClick={() => goTo((active - 1 + products.length) % products.length)} aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <button className="hero-slider__arrow hero-slider__arrow--next" onClick={() => goTo((active + 1) % products.length)} aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      <div className="hero-slider__dots">
        {products.map((_, i) => (
          <button
            key={i}
            className={`hero-slider__dot ${i === active ? 'is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Main Homepage ─── */
const Homepage = ({ onOpenCart }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { products, categories, isLoading: isProductsLoading } = useProducts();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // Visual-only callback for ProductCard fly animation — ProductCard already calls addToCart internally
  const handleCartFly = (product) => {
    // No addToCart here — ProductCard's own handler already did it
  };

  const homepageProducts = useMemo(() => {
    return products.filter((p) => ['oil', 'tea', 'detergent', 'others'].includes(p.category) && p.showOnHomepage !== false);
  }, [products]);

  const featuredProducts = useMemo(() => homepageProducts.filter((p) => p.featured).slice(0, 4), [homepageProducts]);
  const carouselProducts = useMemo(() => homepageProducts.filter((p) => p.showInCarousel === true).slice(0, 6), [homepageProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredProducts = useMemo(() => {
    return homepageProducts.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      const matchSearch = !searchQuery || text.includes(searchQuery);
      return matchCat && matchSearch && p.showOnHomepage !== false;
    });
  }, [activeCategory, searchQuery, homepageProducts]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const visibleProducts = useMemo(() => filteredProducts.slice(startIdx, startIdx + itemsPerPage), [filteredProducts, currentPage, startIdx]);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handlePageJump = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery]);

  const statChips = [
    { icon: <Package size={14} />, label: `${products.length}+ Products` },
    { icon: <Star size={14} />, label: '5-Star Rated' },
    { icon: <Truck size={14} />, label: 'Fast Delivery' },
    { icon: <ShieldCheck size={14} />, label: 'Secure & Safe' },
  ];

  return (
    <div className="homepage">
      {/* Hero gradient mesh background */}
      <div className="homepage__mesh-bg" aria-hidden="true" />

      {/* ── Hero Section ── */}
      <section className="homepage__hero section">
        <div className="container">
          <div className="homepage__hero-grid">
            <motion.div
              className="homepage__hero-copy"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="homepage__hero-badge glass-chip glass-chip--glow">
                <Zap size={12} /> Premium Quality
              </div>
              <h1 className="heading-1 homepage__hero-title">
                <span className="homepage__hero-line">Premium quality</span>
                <span className="homepage__hero-line homepage__hero-line--accent gradient-text">everyday essentials</span>
              </h1>
              <p className="text-muted homepage__subtitle">
                Shop cooking oils, tea, and household essentials with reliable quality and sophisticated doorstep delivery from Roshan Enterprises.
              </p>

              {/* Stat chips */}
              <div className="homepage__stat-chips">
                {statChips.map((chip, i) => (
                  <motion.span
                    key={chip.label}
                    className="glass-chip"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {chip.icon} {chip.label}
                  </motion.span>
                ))}
              </div>

              <motion.div
                className="flex gap-4 homepage__hero-cta"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link to="/categories" className="btn btn-gradient">
                  Shop Collection <ArrowRight size={16} />
                </Link>
                <button onClick={onOpenCart} className="btn btn-outline">
                  View Cart
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              className="homepage__hero-visual"
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroSlider
                products={carouselProducts.length > 0 ? carouselProducts : (featuredProducts.length > 0 ? featuredProducts : homepageProducts.slice(0, 4))}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Promos ── */}
      <RevealSection className="section homepage__promos-section" delay={0}>
        <div className="container">
          <div className="homepage__promos">
            {[
              { icon: <Truck size={28} />, title: 'Fast Delivery', desc: 'Complimentary shipping on qualifying orders.' },
              { icon: <ShieldCheck size={28} />, title: 'Secure Checkout', desc: '100% protected and safe transactions.' },
              { icon: <Store size={28} />, title: 'Premium Quality', desc: 'Sourced from the finest local suppliers.' },
            ].map((promo, i) => (
              <motion.div
                key={promo.title}
                className="homepage__promo glass-card--premium glass-hover-sweep"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <div className="homepage__promo-icon-wrap">{promo.icon}</div>
                <h3 className="heading-3">{promo.title}</h3>
                <p className="text-muted">{promo.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Products Section ── */}
      <RevealSection className="section homepage__products">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-4 homepage__products-header">
            <h2 className="heading-2 section-title-underline in-view">Curated Collection</h2>
            <p className="text-muted">Discover our selection of premium household products.</p>
          </div>

          <div className="homepage__toolbar">
            <div className="homepage__search glass-card--premium">
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
              <button className={`homepage__filter ${activeCategory === 'all' ? 'is-active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
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
                <div key={i} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          ) : visibleProducts.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-4 gap-8"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {visibleProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    variants={{ hidden: { opacity: 0, y: 24, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={product} onQuickView={setQuickViewProduct} onAddToCartFly={handleCartFly} />
                  </motion.div>
                ))}
              </motion.div>
              {totalPages > 1 && (
                <div className="pagination-container glass-card--premium">
                  <button className="pagination-btn btn btn-outline" onClick={handlePrevPage} disabled={currentPage === 1} aria-label="Previous page">
                    <ChevronLeft size={18} />
                    <span className="pagination-btn__text">Prev</span>
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => handlePageJump(page)} className={`pagination-page ${currentPage === page ? 'is-active' : ''}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button className="pagination-btn btn btn-outline" onClick={handleNextPage} disabled={currentPage === totalPages} aria-label="Next page">
                    <span className="pagination-btn__text">Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
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
              className="quickview-modal glass-card--premium"
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="quickview-close" onClick={() => setQuickViewProduct(null)}>
                <X size={20} />
              </button>
              <div className="quickview-grid">
                <div className="quickview-image-wrap">
                  {(() => {
                    const imgs = Array.isArray(quickViewProduct.images) && quickViewProduct.images.length ? quickViewProduct.images : (quickViewProduct.image ? [quickViewProduct.image] : []);
                    return <img src={imgs[0] || ''} alt={quickViewProduct.name} className="quickview-image" />;
                  })()}
                </div>
                <div className="quickview-content">
                  <span className="quickview-category glass-chip glass-chip--accent">{quickViewProduct.category}</span>
                  <h2 className="heading-2">{quickViewProduct.name}</h2>
                  <p className="text-muted quickview-desc">{quickViewProduct.description}</p>
                  <p className="quickview-price gradient-text">₹{quickViewProduct.price?.toFixed(2)}</p>
                  <button className="btn btn-gradient w-full" onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}>
                    <Zap size={15} /> Add to Cart
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
