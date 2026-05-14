import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import './Homepage.css';

const slides = [
  {
    title: 'AI Concierge Layer',
    text: 'A realistic assistant that responds like a trained sales guide and routes visitors to the right products fast.',
    metric: '34% higher assisted conversion',
    image: '/images/products/serum.jpg',
  },
  {
    title: 'Immersive Story Scroll',
    text: 'Every section reveals a new value point with motion and contrast that keeps users exploring.',
    metric: '2.3x longer browsing sessions',
    image: '/images/products/packaging.jpg',
  },
  {
    title: 'High-Intent CTA System',
    text: 'Button styles and copy tuned for clarity, confidence, and frictionless next steps.',
    metric: '42% more CTA interactions',
    image: '/images/products/bundle.jpg',
  },
];

const flow = [
  {
    step: '01',
    name: 'Hook',
    desc: 'Cinematic hero with strong hierarchy and proof cues.',
  },
  {
    step: '02',
    name: 'Engage',
    desc: 'Hover-rich cards and interactive modules that reward exploration.',
  },
  {
    step: '03',
    name: 'Guide',
    desc: 'AI concierge helps with objections, intent, and recommendations.',
  },
  {
    step: '04',
    name: 'Convert',
    desc: 'Focused CTAs and low-friction actions from browse to checkout.',
  },
];

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const value = Math.min(Math.max((window.scrollY / total) * 100, 0), 100);
      setProgress(value);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}

export default function Home() {
  const { products } = useProducts();
  const [active, setActive] = useState(0);
  const [isShowcasePaused, setIsShowcasePaused] = useState(false);
  const [productCarouselStart, setProductCarouselStart] = useState(0);
  const [ripples, setRipples] = useState([]);
  const heroRef = useRef(null);
  const heroRafRef = useRef(null);
  const rippleTimeoutsRef = useRef([]);
  const [recentlyViewedIds] = useState(() => {
    const parsed = JSON.parse(window.localStorage.getItem('lumi-recently-viewed') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  });
  const progress = useScrollProgress();
  const currentSlide = useMemo(() => slides[active], [active]);
  const weeklyDiscountProducts = useMemo(() => products.filter((product) => product.originalPrice).slice(0, 4), []);
  const carouselProducts = useMemo(() => products.slice(0, 10), []);
  const visibleCarouselProducts = useMemo(
    () => carouselProducts.slice(productCarouselStart, productCarouselStart + 4),
    [carouselProducts, productCarouselStart]
  );
  const recentlyViewedProducts = useMemo(
    () => recentlyViewedIds.map((id) => products.find((item) => item.id === id)).filter(Boolean).slice(0, 4),
    [recentlyViewedIds]
  );

  useEffect(() => {
    if (isShowcasePaused) return undefined;

    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isShowcasePaused]);

  const openConcierge = () => {
    window.dispatchEvent(new CustomEvent('open-dh-concierge'));
  };

  const maxCarouselStart = Math.max(0, carouselProducts.length - 4);
  const nextCarousel = () => {
    setProductCarouselStart((prev) => (prev >= maxCarouselStart ? 0 : prev + 1));
  };
  const prevCarousel = () => {
    setProductCarouselStart((prev) => (prev <= 0 ? maxCarouselStart : prev - 1));
  };

  const onShowcaseTabKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActive((index + 1) % slides.length);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActive((index - 1 + slides.length) % slides.length);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActive(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActive(slides.length - 1);
    }
  };

  const setHeroTilt = (x, y) => {
    const el = heroRef.current;
    if (!el) return;
    const hue = Math.round(22 + (x / 100) * 195);
    el.style.setProperty('--mx', String(x));
    el.style.setProperty('--my', String(y));
    el.style.setProperty('--mh', String(hue));
  };

  const handleHeroMove = (event) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (heroRafRef.current) window.cancelAnimationFrame(heroRafRef.current);
    heroRafRef.current = window.requestAnimationFrame(() => setHeroTilt(x, y));
  };

  const handleHeroLeave = () => {
    if (heroRafRef.current) window.cancelAnimationFrame(heroRafRef.current);
    setHeroTilt(50, 50);
  };

  const handleHeroClick = (event) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const hue = Math.round(22 + (x / 100) * 195);
    const alpha = (0.48 + ((100 - y) / 100) * 0.26).toFixed(2);
    const burst = [0, 120, 240];

    burst.forEach((delay, index) => {
      const id = Date.now() + Math.random() + index;
      const scale = 1 + index * 0.26;

      setRipples((prev) => [...prev, { id, x, y, delay, scale, hue, alpha }]);

      const timeoutId = window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
      }, 1220 + delay);

      rippleTimeoutsRef.current.push(timeoutId);
    });
  };

  useEffect(() => {
    const timeoutIds = rippleTimeoutsRef.current;

    return () => {
      if (heroRafRef.current) window.cancelAnimationFrame(heroRafRef.current);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  return (
    <div className="dh-home-v2" style={{ '--scroll-depth': progress }}>
      <div className="dh-scroll-meter" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <section
        ref={heroRef}
        className="dhv2-hero"
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        onClick={handleHeroClick}
      >
        <div className="dhv2-hero-bg" />
        <div className="dhv2-ambient" aria-hidden="true">
          <span className="dhv2-cursor-field" />

          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="dhv2-ripple"
              style={{
                '--rx': `${ripple.x}%`,
                '--ry': `${ripple.y}%`,
                '--rdelay': `${ripple.delay}ms`,
                '--rscale': ripple.scale,
                '--rh': ripple.hue,
                '--ra': ripple.alpha,
              }}
            />
          ))}

          <span className="dhv2-orb dhv2-orb-a" />
          <span className="dhv2-orb dhv2-orb-b" />
          <span className="dhv2-orb dhv2-orb-c" />

          <span className="dhv2-ring dhv2-ring-a" />
          <span className="dhv2-ring dhv2-ring-b" />

          <span className="dhv2-spark dhv2-spark-fall s1" />
          <span className="dhv2-spark dhv2-spark-fall s2" />
          <span className="dhv2-spark dhv2-spark-fall s3" />
          <span className="dhv2-spark dhv2-spark-fall s4" />
          <span className="dhv2-spark dhv2-spark-rise s5" />
          <span className="dhv2-spark dhv2-spark-rise s6" />
          <span className="dhv2-spark dhv2-spark-rise s7" />
          <span className="dhv2-spark dhv2-spark-rise s8" />

          <span className="dhv2-trail t1" />
          <span className="dhv2-trail t2" />
          <span className="dhv2-trail t3" />

          <span className="dhv2-grain g1" />
          <span className="dhv2-grain g2" />
          <span className="dhv2-grain g3" />
          <span className="dhv2-grain g4" />
          <span className="dhv2-grain g5" />
          <span className="dhv2-grain g6" />
          <span className="dhv2-grain g7" />
          <span className="dhv2-grain g8" />
        </div>
        <div className="dhv2-container dhv2-hero-grid">
          <div className="dhv2-copy reveal-left">
            <p className="dhv2-kicker">Lumi Glow: Advanced Beauty Experience</p>
            <h1>Unique visual flow that makes users want to keep scrolling.</h1>
            <p>
              This layout is built to feel premium and active: strong hover reactions, cinematic transitions, carousel storytelling,
              and an AI assistant that behaves like a real conversion specialist.
            </p>
            <div className="dhv2-actions">
              <Link to="/products" className="dhv2-btn dhv2-btn-primary">Explore Products</Link>
              <button type="button" className="dhv2-btn dhv2-btn-outline" onClick={openConcierge}>Launch AI Concierge</button>
            </div>
            <div className="dhv2-pills">
              <span>High-impact hover interactions</span>
              <span>Autoplay carousel + manual controls</span>
              <span>Conversion-oriented storytelling</span>
            </div>
          </div>

          <aside className="dhv2-signal reveal-right">
            <h3>Live Experience Pulse</h3>
            <div className="dhv2-signal-grid">
              <article>
                <strong>4.9/5</strong>
                <small>User delight score</small>
              </article>
              <article>
                <strong>+68%</strong>
                <small>Scroll depth</small>
              </article>
              <article>
                <strong>24/7</strong>
                <small>AI assist availability</small>
              </article>
            </div>
            <p className="dhv2-signal-note">Keep scrolling to unlock each value block.</p>
          </aside>
        </div>
      </section>

      <section className="dhv2-strip" aria-label="Feature strip">
        <div className="dhv2-strip-track">
          <span>Premium button motion</span>
          <span>Magnetic hover cards</span>
          <span>Story-first layout</span>
          <span>AI-guided recommendations</span>
          <span>Fast checkout pathways</span>
          <span>Premium button motion</span>
          <span>Magnetic hover cards</span>
          <span>Story-first layout</span>
          <span>AI-guided recommendations</span>
          <span>Fast checkout pathways</span>
        </div>
      </section>

      <section className="dhv2-container dhv2-feature-grid reveal">
        <article className="dhv2-feature dhv2-feature-a">
          <h3>Attractive product storytelling</h3>
          <p>Every card reacts with depth and glow to make browsing feel alive.</p>
        </article>
        <article className="dhv2-feature dhv2-feature-b">
          <h3>Advanced CTA hierarchy</h3>
          <p>Primary and secondary actions remain clear across all sections and devices.</p>
        </article>
        <article className="dhv2-feature dhv2-feature-c">
          <h3>Scroll momentum design</h3>
          <p>Sequenced reveal blocks keep attention and reduce bounce behavior.</p>
        </article>
      </section>

      <section
        className="dhv2-container dhv2-carousel reveal-scale"
        role="region"
        aria-roledescription="carousel"
        aria-label="Lumi Glow showcase"
        onMouseEnter={() => setIsShowcasePaused(true)}
        onMouseLeave={() => setIsShowcasePaused(false)}
        onFocusCapture={() => setIsShowcasePaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsShowcasePaused(false);
          }
        }}
      >
        <div className="dhv2-carousel-head">
          <p className="dhv2-kicker">Carousel Effect</p>
          <h2>Interactive showcase module</h2>
          <button
            type="button"
            className="dhv2-carousel-toggle"
            onClick={() => setIsShowcasePaused((prev) => !prev)}
            aria-pressed={isShowcasePaused}
          >
            {isShowcasePaused ? 'Resume Rotation' : 'Pause Rotation'}
          </button>
        </div>

        <div
          className="dhv2-carousel-card"
          id={`showcase-panel-${active}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${active + 1} of ${slides.length}`}
          aria-live={isShowcasePaused ? 'polite' : 'off'}
        >
          <img src={currentSlide.image} alt={currentSlide.title} />
          <div className="dhv2-carousel-copy">
            <h3>{currentSlide.title}</h3>
            <p>{currentSlide.text}</p>
            <div className="dhv2-badge">{currentSlide.metric}</div>
            <div className="dhv2-dots" role="tablist" aria-label="Showcase slides">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  role="tab"
                  id={`showcase-tab-${index}`}
                  aria-selected={active === index}
                  aria-controls={`showcase-panel-${index}`}
                  tabIndex={active === index ? 0 : -1}
                  className={`dhv2-dot ${active === index ? 'active' : ''}`}
                  aria-label={`Go to ${slide.title}`}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onShowcaseTabKeyDown(event, index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="dhv2-container dhv2-weekly-deals reveal">
        <div className="dhv2-section-head-row">
          <div>
            <p className="dhv2-kicker">This Week's Discounts</p>
            <h2>Limited Time Offers</h2>
          </div>
          <Link to="/products" className="dhv2-btn dhv2-btn-outline">View All Products</Link>
        </div>
        <div className="products-full-grid dhv2-weekly-grid">
          {weeklyDiscountProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} delay={index * 0.06} />
          ))}
        </div>
      </section>

      <section className="dhv2-container dhv2-product-carousel reveal-scale">
        <div className="dhv2-section-head-row">
          <div>
            <p className="dhv2-kicker">Product Carousel</p>
            <h2>Trending in Lumi Glow</h2>
          </div>
          <div className="dhv2-carousel-controls">
            <button type="button" onClick={prevCarousel} aria-label="Previous products">←</button>
            <button type="button" onClick={nextCarousel} aria-label="Next products">→</button>
          </div>
        </div>

        <div className="dhv2-product-track">
          {visibleCarouselProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="dhv2-product-slide">
              <img src={product.image} alt={product.name} loading="lazy" />
              <div>
                <h4>{product.name}</h4>
                <p>{product.brand}</p>
                <strong>₹{product.price.toFixed(2)}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="dhv2-journey reveal">
        <div className="dhv2-container">
          <p className="dhv2-kicker">Experience Journey</p>
          <h2>A scroll sequence that increases buying intent</h2>
          <div className="dhv2-journey-grid">
            {flow.map((item) => (
              <article key={item.step} className="dhv2-journey-card">
                <span>{item.step}</span>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {recentlyViewedProducts.length > 0 && (
        <section className="dhv2-container dhv2-product-carousel reveal-glow">
          <div className="dhv2-section-head-row">
            <div>
              <p className="dhv2-kicker">Continue Shopping</p>
              <h2>Recently Viewed</h2>
            </div>
            <Link to="/products" className="dhv2-btn dhv2-btn-outline">Browse Catalog</Link>
          </div>
          <div className="dhv2-product-track">
            {recentlyViewedProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="dhv2-product-slide">
                <img src={product.image} alt={product.name} loading="lazy" />
                <div>
                  <h4>{product.name}</h4>
                  <p>{product.brand}</p>
                  <strong>₹{product.price.toFixed(2)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dhv2-container dhv2-final reveal">
        <div className="dhv2-final-card">
          <h2>Ready for an advanced, attractive storefront?</h2>
          <p>
            Use this upgraded home experience as your conversion-first base. It now combines visual uniqueness, engaging motion,
            carousel storytelling, and a realistic AI support layer.
          </p>
          <div className="dhv2-actions">
            <Link to="/products" className="dhv2-btn dhv2-btn-primary">Shop Now</Link>
            <Link to="/contact" className="dhv2-btn dhv2-btn-outline">Get Custom Setup</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
