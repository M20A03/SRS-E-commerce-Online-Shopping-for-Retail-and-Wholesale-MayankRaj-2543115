// IMPROVEMENT: Memoized GlobalFX ambient background component with optimized rendering and subtle low-overhead particles
import React from 'react';
import { useLocation } from 'react-router-dom';

const sparkPoints = [
  { x: 10, y: 20, size: 4, delay: '0.5s', duration: '8s' },
  { x: 30, y: 60, size: 5, delay: '1.5s', duration: '9s' },
  { x: 50, y: 35, size: 4, delay: '2.2s', duration: '7.5s' },
  { x: 70, y: 75, size: 5, delay: '0.8s', duration: '8.5s' },
  { x: 90, y: 25, size: 4, delay: '1.8s', duration: '9.5s' }
];

function GlobalFX() {
  const location = useLocation();
  const path = location.pathname;

  let pageTheme = 'theme-default';
  if (path === '/') pageTheme = 'theme-home';
  else if (path.includes('/categories') || path.includes('/products')) pageTheme = 'theme-products';
  else if (path.includes('/about')) pageTheme = 'theme-about';
  else pageTheme = 'theme-muted';

  return (
    <div className={`global-fx ${pageTheme}`} aria-hidden="true">
      <div className="global-fx-glow" />
      <div className="global-fx-orbit global-fx-orbit-a" />
      <div className="global-fx-orbit global-fx-orbit-b" />

      {sparkPoints.map((spark, index) => (
        <span
          key={`spark-${index}`}
          className="global-fx-spark"
          style={{
            '--x': `${spark.x}%`,
            '--y': `${spark.y}%`,
            '--size': `${spark.size}px`,
            '--delay': spark.delay,
            '--duration': spark.duration,
          }}
        />
      ))}
    </div>
  );
}

export default React.memo(GlobalFX);
