'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface ParticleNetworkProps {
  className?: string;
  /** Override particle count (default: auto-detected based on viewport/hardware) */
  particleCount?: number;
  /** Particle and line color (default: '#1D9E75') */
  color?: string;
}

/**
 * Animated particle network background using Canvas 2D.
 * Renders floating particles connected by faint lines.
 * Automatically pauses when not visible and respects reduced motion preferences.
 */
export default function ParticleNetwork({
  className,
  particleCount,
  color = '#1D9E75',
}: ParticleNetworkProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: visibilityRef, isVisible } = useIntersectionObserver({ threshold: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const isVisibleRef = useRef(isVisible);

  // Keep visibility ref in sync for use inside animation loop
  isVisibleRef.current = isVisible;

  /**
   * Determine optimal particle count based on viewport width and hardware.
   */
  const getParticleCount = useCallback((): number => {
    if (particleCount !== undefined) return particleCount;

    const isMobile = window.innerWidth < 768;
    const isLowEnd =
      typeof navigator !== 'undefined' &&
      'hardwareConcurrency' in navigator &&
      navigator.hardwareConcurrency < 4;

    return isMobile || isLowEnd ? 60 : 120;
  }, [particleCount]);

  /**
   * Initialize particles with random positions and velocities.
   */
  const initParticles = useCallback(
    (width: number, height: number): Particle[] => {
      const count = getParticleCount();
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        // Random velocity between 0.3 and 0.5 px/frame in either direction
        const speed = () => (Math.random() * 0.2 + 0.3) * (Math.random() < 0.5 ? -1 : 1);

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: speed(),
          vy: speed(),
        });
      }

      return particles;
    },
    [getParticleCount]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cap devicePixelRatio at 2 for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /**
     * Resize canvas to fill parent, accounting for device pixel ratio.
     */
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      return { width, height };
    };

    const dims = resizeCanvas();
    if (!dims) return;

    // Initialize particles within canvas bounds
    particlesRef.current = initParticles(dims.width, dims.height);

    const CONNECTION_DISTANCE = 150;
    const PARTICLE_RADIUS = 2;
    const PARTICLE_OPACITY = 0.7;
    const LINE_OPACITY = 0.08;

    /**
     * Core animation loop: move particles, draw connections, draw particles.
     */
    const animate = () => {
      // Only animate when visible
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      const particles = particlesRef.current;

      // Clear canvas (use CSS dimensions, not scaled dimensions)
      ctx.clearRect(0, 0, width, height);

      // Update positions and bounce off edges
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) {
          p.vx = -p.vx;
          p.x = Math.max(0, Math.min(width, p.x));
        }
        if (p.y <= 0 || p.y >= height) {
          p.vy = -p.vy;
          p.y = Math.max(0, Math.min(height, p.y));
        }
      }

      // Draw connections between nearby particles
      ctx.strokeStyle = color;
      ctx.globalAlpha = LINE_OPACITY;
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      ctx.fillStyle = color;
      ctx.globalAlpha = PARTICLE_OPACITY;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset globalAlpha
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    /**
     * Handle window resize: adjust canvas and re-constrain particles.
     */
    const handleResize = () => {
      // Reset scale before resizing to avoid compound scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const newDims = resizeCanvas();
      if (!newDims) return;

      // Re-constrain existing particles within new bounds
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        particles[i].x = Math.min(particles[i].x, newDims.width);
        particles[i].y = Math.min(particles[i].y, newDims.height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: cancel animation frame and remove listener
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, initParticles]);

  // Don't render canvas if user prefers reduced motion
  if (prefersReducedMotion) return null;

  return (
    <div
      ref={visibilityRef as React.RefObject<HTMLDivElement>}
      className={className}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full pointer-events-none"
      />
    </div>
  );
}
