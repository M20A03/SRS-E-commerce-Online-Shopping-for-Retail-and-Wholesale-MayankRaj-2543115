import { useEffect, useRef } from 'react';
import './SparkleCanvas.css';

const PARTICLE_COUNT = 55;

const random = (min, max) => Math.random() * (max - min) + min;

class Sparkle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    const { width, height } = this.canvas;
    this.x = random(0, width);
    this.y = random(0, height);
    this.size = random(1.5, 4.5);
    this.opacity = 0;
    this.maxOpacity = random(0.3, 0.85);
    this.speed = random(0.2, 0.6);
    this.phase = random(0, Math.PI * 2); // for sine wave movement
    this.drift = random(-0.3, 0.3);
    this.color = this.pickColor();
    this.life = 0;
    this.maxLife = random(120, 260);
    this.rising = true;
  }

  pickColor() {
    const palette = [
      'rgba(99,102,241,',   // indigo
      'rgba(249,115,22,',   // warm orange
      'rgba(245,158,11,',   // amber
      'rgba(167,139,250,',  // soft violet
      'rgba(16,185,129,',   // emerald green
      'rgba(255,255,255,',  // white
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  update() {
    this.life++;
    const halfLife = this.maxLife / 2;
    if (this.rising) {
      this.opacity = Math.min(this.maxOpacity, (this.life / halfLife) * this.maxOpacity);
      if (this.life >= halfLife) this.rising = false;
    } else {
      this.opacity = Math.max(0, this.maxOpacity - ((this.life - halfLife) / halfLife) * this.maxOpacity);
    }

    this.y -= this.speed;
    this.x += Math.sin(this.phase + this.life * 0.04) * this.drift;

    if (this.life >= this.maxLife || this.y < -10) {
      this.reset();
      this.y = this.canvas.height + 5;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    // Draw a 4-point star sparkle
    ctx.translate(this.x, this.y);
    ctx.rotate(this.life * 0.02);
    ctx.fillStyle = `${this.color}${this.opacity})`;
    ctx.beginPath();
    const s = this.size;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const inner = s * 0.4;
      const outer = s;
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.lineTo(Math.cos(angle + Math.PI / 4) * inner, Math.sin(angle + Math.PI / 4) * inner);
    }
    ctx.closePath();
    ctx.fill();

    // Add a soft glow behind the star
    ctx.globalAlpha = this.opacity * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, s * 2, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2);
    grad.addColorStop(0, `${this.color}0.6)`);
    grad.addColorStop(1, `${this.color}0)`);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }
}

const SparkleCanvas = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('scroll', resize, { passive: true });

    // Spawn particles scattered across the full page
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const p = new Sparkle(canvas);
      p.life = Math.floor(random(0, p.maxLife)); // start at random phase
      return p;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('scroll', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="sparkle-canvas" aria-hidden="true" />;
};

export default SparkleCanvas;
