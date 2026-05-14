import { useLocation } from 'react-router-dom';

const sparkPoints = [
  { x: 6, y: 14, size: 5, delay: '0.2s', duration: '5.8s' },
  { x: 14, y: 72, size: 4, delay: '1.2s', duration: '6.4s' },
  { x: 21, y: 32, size: 6, delay: '0.8s', duration: '7.6s' },
  { x: 29, y: 58, size: 5, delay: '1.6s', duration: '5.2s' },
  { x: 38, y: 22, size: 4, delay: '2.1s', duration: '6.9s' },
  { x: 46, y: 78, size: 5, delay: '1.4s', duration: '7.1s' },
  { x: 54, y: 44, size: 6, delay: '0.5s', duration: '6.1s' },
  { x: 62, y: 16, size: 4, delay: '2.6s', duration: '8.2s' },
  { x: 69, y: 63, size: 5, delay: '1.9s', duration: '5.6s' },
  { x: 76, y: 36, size: 6, delay: '0.3s', duration: '6.7s' },
  { x: 84, y: 68, size: 4, delay: '2.3s', duration: '7.4s' },
  { x: 92, y: 24, size: 5, delay: '1.1s', duration: '6.3s' },

  { x: 12, y: 45, size: 6, delay: '3.1s', duration: '5.5s' },
  { x: 25, y: 15, size: 5, delay: '2.4s', duration: '6.8s' },
  { x: 42, y: 65, size: 7, delay: '0.7s', duration: '7.2s' },
  { x: 65, y: 85, size: 5, delay: '1.8s', duration: '5.9s' },
  { x: 88, y: 45, size: 4, delay: '2.7s', duration: '6.5s' }
];

const fallPaths = [
  { x: 8, delay: '0.4s', duration: '9.8s' },
  { x: 26, delay: '2s', duration: '8.6s' },
  { x: 41, delay: '1.3s', duration: '10.4s' },
  { x: 58, delay: '2.8s', duration: '8.2s' },
  { x: 73, delay: '0.9s', duration: '9.1s' },
  { x: 89, delay: '2.2s', duration: '10s' },
  { x: 15, delay: '3.5s', duration: '8.5s' },
  { x: 68, delay: '4.2s', duration: '9.5s' },
];

const risePaths = [
  { x: 12, delay: '1s', duration: '10.1s' },
  { x: 34, delay: '2.5s', duration: '9.6s' },
  { x: 52, delay: '0.6s', duration: '8.8s' },
  { x: 67, delay: '1.8s', duration: '10.5s' },
  { x: 81, delay: '2.9s', duration: '8.9s' },
  { x: 95, delay: '1.4s', duration: '9.7s' },
  { x: 22, delay: '3.1s', duration: '9.2s' },
  { x: 78, delay: '0.3s', duration: '8.4s' },
];

export default function GlobalFX() {
  const location = useLocation();
  const path = location.pathname;

  let pageTheme = 'theme-default';
  if (path === '/') pageTheme = 'theme-home';
  else if (path.includes('/products')) pageTheme = 'theme-products';
  else if (path.includes('/about') || path.includes('/sustainability')) pageTheme = 'theme-about';
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

      {fallPaths.map((drop, index) => (
        <span
          key={`fall-${index}`}
          className="global-fx-fall"
          style={{
            '--x': `${drop.x}%`,
            '--delay': drop.delay,
            '--duration': drop.duration,
          }}
        />
      ))}

      {risePaths.map((lift, index) => (
        <span
          key={`rise-${index}`}
          className="global-fx-rise"
          style={{
            '--x': `${lift.x}%`,
            '--delay': lift.delay,
            '--duration': lift.duration,
          }}
        />
      ))}
    </div>
  );
}
