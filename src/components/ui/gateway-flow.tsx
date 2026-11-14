import { useEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface GatewayFlowProps {
  /** Animation speed multiplier (0 to 6). */
  speed?: number;
  /** Path density multiplier (0.25 to 2.5). */
  density?: number;
  /** Base Bezier curve stroke width in CSS pixels. */
  strokeWidth?: number;
  /** Overall canvas opacity (0 to 1). */
  opacity?: number;
  /** Enable click-ripple dispersion across active particles. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface FlowParticle {
  t: number;
  speed: number;
}

interface FlowPath {
  isLeft: boolean;
  isAmber: boolean;
  startYRatio: number;
  particles: FlowParticle[];
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  life: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function createFlowPaths(count: number): FlowPath[] {
  return Array.from({ length: count }, (_, index) => ({
    isLeft: index % 2 === 0,
    isAmber: index % 3 === 0,
    startYRatio: (index / count) * 1.4 - 0.2,
    particles: [
      {
        t: Math.random(),
        speed: 0.0014 + Math.random() * 0.002,
      },
    ],
  }));
}

function getBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  };
}

/**
 * Pure React canvas implementation of converging cubic-Bezier particle flows
 * tuned for the portfolio's dark (#0d0f12) and amber (#f59e0b) palette.
 */
export function GatewayFlow({
  speed = 1,
  density = 1,
  strokeWidth = 1.15,
  opacity = 1,
  interactive = true,
  className,
  style,
}: GatewayFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(clamp(speed, 0, 6));
  const strokeWidthRef = useRef(clamp(strokeWidth, 0.25, 6));
  const interactiveRef = useRef(interactive);

  speedRef.current = clamp(speed, 0, 6);
  strokeWidthRef.current = clamp(strokeWidth, 0.25, 6);
  interactiveRef.current = interactive;

  const pathCount = Math.max(12, Math.round(72 * clamp(density, 0.25, 2.5)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let explosions: Explosion[] = [];
    const paths = createFlowPaths(pathCount);

    const resize = () => {
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;
    if (resizeObserver && canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener("resize", resize);

    const handleWindowClick = (event: MouseEvent) => {
      if (!interactiveRef.current || prefersReducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      explosions.push({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        radius: 0,
        life: 1,
      });
    };
    window.addEventListener("click", handleWindowClick);

    const renderFrame = (animate: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const currentSpeed = speedRef.current;
      const currentStroke = strokeWidthRef.current;

      if (animate) {
        explosions.forEach((exp) => {
          exp.radius += 15;
          exp.life -= 0.016;
        });
        explosions = explosions.filter((exp) => exp.life > 0);
      }

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const startY = path.startYRatio * height;
        const p0 = { x: path.isLeft ? 0 : width, y: startY };
        const p1 = {
          x: path.isLeft ? centerX * 0.5 : width - centerX * 0.5,
          y: startY,
        };
        const p2 = {
          x: path.isLeft ? centerX * 0.8 : width - centerX * 0.8,
          y: centerY,
        };
        const p3 = { x: centerX, y: centerY };

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = path.isAmber
          ? "rgba(245, 158, 11, 0.24)"
          : "rgba(161, 161, 170, 0.2)";
        ctx.lineWidth = currentStroke;
        ctx.setLineDash([1.5, 4.5]);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let k = 0; k < path.particles.length; k++) {
          const particle = path.particles[k];
          if (animate) {
            particle.t += particle.speed * currentSpeed;
            if (particle.t > 1) {
              particle.t = 0;
              path.startYRatio += (Math.random() - 0.5) * 0.015;
            }
          }

          const pos = getBezierPoint(particle.t, p0, p1, p2, p3);
          let dxTotal = 0;
          let dyTotal = 0;

          for (let e = 0; e < explosions.length; e++) {
            const exp = explosions[e];
            const dx = pos.x - exp.x;
            const dy = pos.y - exp.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < exp.radius + 120 && dist > exp.radius - 120) {
              const force =
                (1 - Math.abs(dist - exp.radius) / 120) * exp.life;
              dxTotal += (dx / dist) * force * 80;
              dyTotal += (dy / dist) * force * 80;
            }
          }

          ctx.fillStyle = path.isAmber
            ? "rgba(245, 158, 11, 0.85)"
            : "rgba(228, 228, 231, 0.65)";
          ctx.fillRect(pos.x + dxTotal - 1.5, pos.y + dyTotal - 1.5, 3, 3);
        }
      }
    };

    const tick = () => {
      renderFrame(true);
      animationFrameId = requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      renderFrame(false);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleWindowClick);
    };
  }, [pathCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full pointer-events-none", className)}
      style={{ opacity: clamp(opacity, 0, 1), ...style }}
    />
  );
}

export default GatewayFlow;
