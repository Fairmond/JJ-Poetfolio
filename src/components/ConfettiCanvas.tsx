import React, { useEffect, useRef, useCallback } from 'react';

// Classic celebration party paper confetti palette (Bright, vibrant, matte paper tones with soft shadow undersides)
const CONFETTI_PALETTE = [
  { front: '#ff3b30', back: '#c92a2a' }, // Festive Red
  { front: '#ffcc00', back: '#d4a000' }, // Sunny Yellow
  { front: '#34c759', back: '#228b3f' }, // Paper Green
  { front: '#007aff', back: '#0056b3' }, // Sky Blue
  { front: '#ff9500', back: '#cc7000' }, // Tangy Orange
  { front: '#af52de', back: '#7d32a8' }, // Lavender Violet
  { front: '#ff2d55', back: '#c2183d' }, // Party Pink
  { front: '#5ac8fa', back: '#2b9ac9' }, // Cyan
  { front: '#f3f4f6', back: '#d1d5db' }, // Clean White Paper
];

type ParticleKind = 'flake' | 'strip' | 'spiral_ribbon' | 'wavy_streamer';

interface BaseParticle {
  id: number;
  kind: ParticleKind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  // 3D Euler angles and angular velocities
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  // Visual attributes
  color: (typeof CONFETTI_PALETTE)[number];
  opacity: number;
  life: number;
  maxLife: number;
  drag: number;
  swayPhase: number;
  swaySpeed: number;
  swayRadius: number;
}

// 1. Small standard paper flake / square
interface FlakeParticle extends BaseParticle {
  kind: 'flake';
  width: number;
  height: number;
  isCircle: boolean;
}

// 2. Short-to-medium flat paper strip (长方形小纸条)
interface StripParticle extends BaseParticle {
  kind: 'strip';
  width: number;
  height: number;
}

// 3. Spiral curly paper streamer (自然打卷盘旋彩带)
interface SpiralRibbonParticle extends BaseParticle {
  kind: 'spiral_ribbon';
  segmentCount: number;
  segmentLength: number;
  ribbonWidth: number;
  spiralRadius: number;
  spiralFrequency: number;
  twistAngle: number;
  vTwist: number;
  curlPhase: number;
  curlSpeed: number;
}

// 4. Wavy long paper streamer (自然微弯飘落长彩带)
interface WavyStreamerParticle extends BaseParticle {
  kind: 'wavy_streamer';
  segmentCount: number;
  segmentLength: number;
  ribbonWidth: number;
  waveAmplitude: number;
  waveFrequency: number;
  wavePhase: number;
  waveSpeed: number;
}

type ConfettiParticle = FlakeParticle | StripParticle | SpiralRibbonParticle | WavyStreamerParticle;

// Reusable coordinate buffers to eliminate GC allocations inside 60fps render loop
const MAX_SEGMENTS = 24;
const bufLeftX = new Float32Array(MAX_SEGMENTS + 1);
const bufLeftY = new Float32Array(MAX_SEGMENTS + 1);
const bufRightX = new Float32Array(MAX_SEGMENTS + 1);
const bufRightY = new Float32Array(MAX_SEGMENTS + 1);

export const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const nextIdRef = useRef(0);
  const lastTimeRef = useRef(0);

  // High-performance element interaction detector (zero layout thrashing, native C++ .closest)
  const isInteractiveElement = useCallback((target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;
    return !!target.closest(
      'button, a, input, textarea, select, label, video, audio, [role="button"], [role="link"], [role="tab"], [role="dialog"], .cursor-pointer, .cursor-grab, .cursor-grabbing, #mobile-bottom-sheet, #slide-drawer, #project-modal, #contact-modal, .z-50'
    );
  }, []);

  // Spawn confetti burst at (clientX, clientY)
  const spawnBurst = useCallback((clientX: number, clientY: number, baseCount = 52) => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.min(baseCount, 36) : baseCount;
    const particles = particlesRef.current;

    for (let i = 0; i < count; i++) {
      const id = ++nextIdRef.current;

      // 3D Upward Conical Fountain Ejection Physics (三维立体轻快喷发)
      const coneSpread = Math.pow(Math.random(), 0.75) * (Math.PI * 0.24); // concentrated upwards cone
      const azimuth = Math.random() * Math.PI * 2; // 360-degree radial symmetry
      const launchSpeed = 14 + Math.random() * 12; // Crisp, punchy launch velocity (14 ~ 26 px/frame)

      const horizSpeed = Math.sin(coneSpread) * launchSpeed;
      const vx = Math.cos(azimuth) * horizSpeed;
      const vz = Math.sin(azimuth) * horizSpeed;
      const vy = -Math.cos(coneSpread) * launchSpeed; // Upward impulse

      const color = CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)];
      const maxLife = 140 + Math.random() * 70; // 2.3s ~ 3.5s total life: crisp, active, dynamic

      const randType = Math.random();

      const base: BaseParticle = {
        id,
        kind: 'flake',
        x: clientX,
        y: clientY,
        z: (Math.random() - 0.5) * 30,
        vx,
        vy,
        vz,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.22,
        vry: (Math.random() - 0.5) * 0.24,
        vrz: (Math.random() - 0.5) * 0.16,
        color,
        opacity: 1,
        life: 0,
        maxLife,
        drag: 0.972,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.05 + Math.random() * 0.04, // Lively flutter
        swayRadius: 1.4 + Math.random() * 1.6,
      };

      if (randType < 0.3) {
        // Spiral curly paper streamer (打卷长彩带)
        const segmentCount = 9 + Math.floor(Math.random() * 4);
        particles.push({
          ...base,
          kind: 'spiral_ribbon',
          segmentCount,
          segmentLength: 5.5 + Math.random() * 3.5,
          ribbonWidth: 4.5 + Math.random() * 2.5,
          spiralRadius: 6 + Math.random() * 8,
          spiralFrequency: 0.42 + Math.random() * 0.25,
          twistAngle: Math.random() * Math.PI * 2,
          vTwist: (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.05),
          curlPhase: Math.random() * Math.PI * 2,
          curlSpeed: 0.04 + Math.random() * 0.03,
          drag: 0.968,
        });
      } else if (randType < 0.55) {
        // Wavy smooth streamer (微弯波浪纸彩带)
        const segmentCount = 8 + Math.floor(Math.random() * 4);
        particles.push({
          ...base,
          kind: 'wavy_streamer',
          segmentCount,
          segmentLength: 5 + Math.random() * 3.5,
          ribbonWidth: 4 + Math.random() * 2,
          waveAmplitude: 5 + Math.random() * 6,
          waveFrequency: 0.38 + Math.random() * 0.22,
          wavePhase: Math.random() * Math.PI * 2,
          waveSpeed: 0.05 + Math.random() * 0.03,
          drag: 0.970,
        });
      } else if (randType < 0.8) {
        // Short flat rectangular paper strip (普通小纸条)
        particles.push({
          ...base,
          kind: 'strip',
          width: 5 + Math.random() * 3,
          height: 14 + Math.random() * 12,
          drag: 0.974,
        });
      } else {
        // Square or circular paper flake (小纸屑)
        const isCircle = Math.random() > 0.6;
        particles.push({
          ...base,
          kind: 'flake',
          width: 7 + Math.random() * 5,
          height: 7 + Math.random() * 5,
          isCircle,
          drag: 0.978,
        });
      }
    }

    if (!animFrameIdRef.current) {
      lastTimeRef.current = performance.now();
      loop(performance.now());
    }
  }, []);

  const loop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Delta time normalization (capped at 2.0 to avoid huge leaps after tab switch)
    const dt = Math.min(Math.max((timestamp - (lastTimeRef.current || timestamp)) / 16.67, 0.4), 2.0);
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const gravity = 0.27; // Realistic natural gravity (crisp, festive, active fall)
    const fov = 650;
    const screenBottom = window.innerHeight + 100;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;

      // 1. Fluid drag & gravity
      const dragFactor = Math.pow(p.drag, dt);
      p.vx *= dragFactor;
      p.vy = p.vy * dragFactor + gravity * dt;
      p.vz *= dragFactor;

      // 2. Aerodynamic fluttering (纸片飘落微晃)
      p.swayPhase += p.swaySpeed * dt;
      const swayX = Math.sin(p.swayPhase) * p.swayRadius;
      const swayZ = Math.cos(p.swayPhase) * (p.swayRadius * 0.6);

      p.x += (p.vx + swayX) * dt;
      p.y += p.vy * dt;
      p.z += (p.vz + swayZ) * dt;

      // 3. 3D Angular tumbling
      p.rx += p.vrx * dt;
      p.ry += p.vry * dt;
      p.rz += p.vrz * dt;

      p.vrx *= 0.998;
      p.vry *= 0.998;
      p.vrz *= 0.998;

      // Opacity fadeout towards end of life (gentle fade in the last 25%)
      if (p.life > p.maxLife * 0.75) {
        const remaining = p.maxLife - p.life;
        p.opacity = Math.max(0, remaining / (p.maxLife * 0.25));
      }

      // Cleanup when expired or off-screen
      if (p.life >= p.maxLife || p.y > screenBottom) {
        particles.splice(i, 1);
        continue;
      }

      // ==========================================
      // RENDERING OPTIMIZED 3D CONFETTI
      // ==========================================
      const perspective = fov / Math.max(1, fov + p.z);
      const projX = p.x;
      const projY = p.y;

      const cosX = Math.cos(p.rx), sinX = Math.sin(p.rx);
      const cosY = Math.cos(p.ry), sinY = Math.sin(p.ry);
      const cosZ = Math.cos(p.rz), sinZ = Math.sin(p.rz);

      // Fast inlined 3D rotation without object creation
      const rotateX = (lx: number, ly: number, lz: number): number => {
        const x1 = lx * cosZ - ly * sinZ;
        const y1 = lx * sinZ + ly * cosZ;
        const y2 = y1 * cosX - lz * sinX;
        const z2 = y1 * sinX + lz * cosX;
        const x3 = x1 * cosY + z2 * sinY;
        return projX + x3 * perspective;
      };

      const rotateY = (lx: number, ly: number, lz: number): number => {
        const x1 = lx * cosZ - ly * sinZ;
        const y1 = lx * sinZ + ly * cosZ;
        const y2 = y1 * cosX - lz * sinX;
        return projY + y2 * perspective;
      };

      ctx.save();
      ctx.globalAlpha = p.opacity;

      if (p.kind === 'spiral_ribbon' || p.kind === 'wavy_streamer') {
        // ============================================================
        // CONTINUOUS PAPER RIBBON (平滑连贯实心纸条，预分配坐标无 GC 压力)
        // ============================================================
        if (p.kind === 'spiral_ribbon') {
          p.twistAngle += p.vTwist * dt;
          p.curlPhase += p.curlSpeed * dt;
        } else {
          p.wavePhase += p.waveSpeed * dt;
        }

        const segCount = Math.min(p.segmentCount, MAX_SEGMENTS);
        const segLen = p.segmentLength;
        const ribWidth = p.ribbonWidth;
        const halfW = ribWidth * 0.5;

        for (let s = 0; s <= segCount; s++) {
          const t = s / segCount;
          let spineX = 0;
          const spineY = s * segLen - (segCount * segLen) * 0.5;
          let spineZ = 0;
          let localRoll = 0;

          if (p.kind === 'spiral_ribbon') {
            const spiralAngle = s * p.spiralFrequency + p.curlPhase;
            const currentRadius = p.spiralRadius * Math.sin(t * Math.PI * 0.8 + 0.2);
            spineX = Math.cos(spiralAngle) * currentRadius;
            spineZ = Math.sin(spiralAngle) * currentRadius * 0.7;
            localRoll = p.twistAngle + s * 0.35;
          } else {
            const waveAngle = s * p.waveFrequency + p.wavePhase;
            spineX = Math.sin(waveAngle) * p.waveAmplitude * (0.5 + t * 0.5);
            spineZ = Math.cos(waveAngle) * (p.waveAmplitude * 0.4);
            localRoll = Math.sin(waveAngle) * 0.6;
          }

          const rollCos = Math.cos(localRoll);
          const rollSin = Math.sin(localRoll);

          const lxL = spineX - halfW * rollCos;
          const lzL = spineZ + halfW * rollSin;
          const lxR = spineX + halfW * rollCos;
          const lzR = spineZ - halfW * rollSin;

          bufLeftX[s] = rotateX(lxL, spineY, lzL);
          bufLeftY[s] = rotateY(lxL, spineY, lzL);
          bufRightX[s] = rotateX(lxR, spineY, lzR);
          bufRightY[s] = rotateY(lxR, spineY, lzR);
        }

        // Draw seamless continuous paper segments
        for (let s = 0; s < segCount; s++) {
          const p0x = bufLeftX[s], p0y = bufLeftY[s];
          const p1x = bufRightX[s], p1y = bufRightY[s];
          const p2x = bufRightX[s + 1], p2y = bufRightY[s + 1];
          const p3x = bufLeftX[s + 1], p3y = bufLeftY[s + 1];

          // Face normal Z to determine paper front vs back
          const nz = (p1x - p0x) * (p3y - p0y) - (p1y - p0y) * (p3x - p0x);
          const isFront = nz > 0;

          ctx.beginPath();
          ctx.moveTo(p0x, p0y);
          ctx.lineTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.lineTo(p3x, p3y);
          ctx.closePath();

          ctx.fillStyle = isFront ? p.color.front : p.color.back;
          ctx.fill();
        }

        // Continuous outer longitudinal edge
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(bufLeftX[0], bufLeftY[0]);
        for (let s = 1; s <= segCount; s++) {
          ctx.lineTo(bufLeftX[s], bufLeftY[s]);
        }
        ctx.moveTo(bufRightX[0], bufRightY[0]);
        for (let s = 1; s <= segCount; s++) {
          ctx.lineTo(bufRightX[s], bufRightY[s]);
        }
        ctx.stroke();

      } else if (p.kind === 'strip') {
        // ============================================================
        // SHORT PAPER STRIP (普通长方形纸条)
        // ============================================================
        const w2 = (p.width * perspective) * 0.5;
        const h2 = (p.height * perspective) * 0.5;

        const p0x = rotateX(-w2, -h2, 0), p0y = rotateY(-w2, -h2, 0);
        const p1x = rotateX(w2, -h2, 0), p1y = rotateY(w2, -h2, 0);
        const p2x = rotateX(w2, h2, 0), p2y = rotateY(w2, h2, 0);
        const p3x = rotateX(-w2, h2, 0), p3y = rotateY(-w2, h2, 0);

        const nz = (p1x - p0x) * (p3y - p0y) - (p1y - p0y) * (p3x - p0x);
        const isFront = nz > 0;

        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.closePath();

        ctx.fillStyle = isFront ? p.color.front : p.color.back;
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

      } else {
        // ============================================================
        // FLAKE / SQUARE OR ROUND CONFETTI (普通小纸屑)
        // ============================================================
        const w2 = (p.width * perspective) * 0.5;
        const h2 = (p.height * perspective) * 0.5;

        const p0x = rotateX(-w2, -h2, 0), p0y = rotateY(-w2, -h2, 0);
        const p1x = rotateX(w2, -h2, 0), p1y = rotateY(w2, -h2, 0);
        const p2x = rotateX(w2, h2, 0), p2y = rotateY(w2, h2, 0);
        const p3x = rotateX(-w2, h2, 0), p3y = rotateY(-w2, h2, 0);

        const nz = (p1x - p0x) * (p3y - p0y) - (p1y - p0y) * (p3x - p0x);
        const isFront = nz > 0;

        if (p.isCircle) {
          ctx.beginPath();
          const cx = (p0x + p2x) * 0.5;
          const cy = (p0y + p2y) * 0.5;
          const radiusX = Math.hypot(p1x - p0x, p1y - p0y) * 0.5;
          const radiusY = Math.hypot(p3x - p0x, p3y - p0y) * 0.5;
          const angle = Math.atan2(p1y - p0y, p1x - p0x);
          ctx.ellipse(cx, cy, Math.max(0.5, radiusX), Math.max(0.5, radiusY), angle, 0, Math.PI * 2);
          ctx.fillStyle = isFront ? p.color.front : p.color.back;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(p0x, p0y);
          ctx.lineTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.lineTo(p3x, p3y);
          ctx.closePath();

          ctx.fillStyle = isFront ? p.color.front : p.color.back;
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameIdRef.current = requestAnimationFrame(loop);
    } else {
      animFrameIdRef.current = null;
    }
  }, []);

  // Sync canvas dimensions with viewport & Retina support
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Global click listener: trigger burst at click position unless clicking an interactive element
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;

      const target = e.target as Element | null;
      if (isInteractiveElement(target)) {
        return;
      }

      spawnBurst(e.clientX, e.clientY, 52);
    };

    // Fast pointer move listener: native .closest check, zero layout thrashing
    let rafMoveId: number | null = null;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;

      if (rafMoveId) return;
      rafMoveId = requestAnimationFrame(() => {
        rafMoveId = null;
        const target = e.target as Element | null;
        const isInteractive = isInteractiveElement(target);

        if (isInteractive) {
          if (document.body.classList.contains('confetti-cursor-active')) {
            document.body.classList.remove('confetti-cursor-active');
          }
        } else {
          if (!document.body.classList.contains('confetti-cursor-active')) {
            document.body.classList.add('confetti-cursor-active');
          }
        }
      });
    };

    const handlePointerLeave = () => {
      if (rafMoveId) {
        cancelAnimationFrame(rafMoveId);
        rafMoveId = null;
      }
      document.body.classList.remove('confetti-cursor-active');
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      if (rafMoveId) {
        cancelAnimationFrame(rafMoveId);
      }
      document.body.classList.remove('confetti-cursor-active');
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [spawnBurst, isInteractiveElement]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-40 select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
