// IMPROVEMENT: High-quality, responsive SVG Logo component for Roshan Enterprises
import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ className = '', size = 'medium', showText = true, onClick }) => {
  return (
    <Link to="/" className={`roshan-logo roshan-logo--${size} ${className}`} onClick={onClick} aria-label="Roshan Enterprises Home">
      <svg className="roshan-logo__symbol" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roshanGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a373" />
            <stop offset="50%" stopColor="#b28b6e" />
            <stop offset="100%" stopColor="#5c3d2a" />
          </linearGradient>
          <linearGradient id="roshanInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d1b0e" />
            <stop offset="100%" stopColor="#1e130b" />
          </linearGradient>
          <filter id="roshanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Ring */}
        <circle cx="50" cy="50" r="45" stroke="url(#roshanGoldGrad)" strokeWidth="3" fill="none" />
        <circle cx="50" cy="50" r="40" fill="url(#roshanInnerGrad)" />
        <circle cx="50" cy="50" r="39" stroke="url(#roshanGoldGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* Stylized 'R' Monogram */}
        <path
          d="M38 28 H 52 C 60 28, 66 32, 66 40 C 66 47, 60 51, 52 51 H 45 V 72 H 38 V 28 Z M 45 34 V 45 H 52 C 56 45, 59 43, 59 39.5 C 59 36, 56 34, 52 34 H 45 Z"
          fill="url(#roshanGoldGrad)"
          filter="url(#roshanGlow)"
        />
        {/* Tail stroke of R */}
        <path
          d="M 50 49 L 65 72 H 57 L 44 50 Z"
          fill="url(#roshanGoldGrad)"
        />

        {/* Decorative Crown Dots */}
        <circle cx="50" cy="18" r="2.5" fill="url(#roshanGoldGrad)" />
        <circle cx="42" cy="20" r="1.8" fill="url(#roshanGoldGrad)" />
        <circle cx="58" cy="20" r="1.8" fill="url(#roshanGoldGrad)" />
      </svg>

      {showText && (
        <span className="roshan-logo__text">
          <span className="roshan-logo__title">Roshan</span>
          <span className="roshan-logo__subtitle">ENTERPRISES</span>
        </span>
      )}
    </Link>
  );
};

export default React.memo(Logo);
