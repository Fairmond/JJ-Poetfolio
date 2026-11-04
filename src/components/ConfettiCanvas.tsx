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

// 2. Short-to-medium flat paper strip (长方形小彩条)
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

export const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const nextIdRef = useRef(0);

  // Spawn confetti burst at (clientX, clientY)
  const spawnBurst = useCallback((clientX: number, clientY: number, baseCount = 54) => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.min(baseCount, 40) : baseCount;
    const particles = particlesRef.current;

    for (let i = 0; i < count; i++) {
      const id = ++nextIdRef.current;
      
      // 3D Upward Conical Fountain Ejection Physics (三维立体锥形向上喷发)
      // Spread angle from vertical axis: ~0 to 38 degrees
      const coneSpread = Math.pow(Math.random(), 0.75) * (Math.PI * 0.22); // concentrated upwards cone
      const azimuth = Math.random() * Math.PI * 2; // 360-degree radial symmetry around Y-axis
      const launchSpeed = (10 + Math.random() * 10) * 0.72; // Gentler initial burst impulse (7.2 ~ 14.4)

      const horizSpeed = Math.sin(coneSpread) * launchSpeed;
      const vx = Math.cos(azimuth) * horizSpeed;
      const vz = Math.sin(azimuth) * horizSpeed;
      const vy = -Math.cos(coneSpread) * launchSpeed; // Upward impulse

      const color = CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)];
      const maxLife = 260 + Math.random() * 130; // Longer life (~4.3s - 6.5s) to accompany slower descent

      // Particle mix: ~30% Spiral Streamers (打卷长彩带), ~25% Wavy Streamers (柔顺长彩带), ~25% Short Strips (长方纸条), ~20% Flakes (小碎纸)
      const randType = Math.random();

      const base: BaseParticle = {
        id,
        kind: 'flake',
        x: clientX,
        y: clientY,
        z: (Math.random() - 0.5) * 20,
        vx,
        vy,
        vz,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.14,
        vry: (Math.random() - 0.5) * 0.16,
        vrz: (Math.random() - 0.5) * 0.10,
        color,
        opacity: 1,
        life: 0,
        maxLife,
        drag: 0.965,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.024 + Math.random() * 0.028, // Slower, graceful aerodynamic flutter
        swayRadius: 1.8 + Math.random() * 2.2, // Wider, gentle wandering drift
      };

      if (randType < 0.3) {
        // Spiral curly paper streamer (普通打卷纸彩带)
        const segmentCount = 12 + Math.floor(Math.random() * 6);
        particles.push({
          ...base,
          kind: 'spiral_ribbon',
          segmentCount,
          segmentLength: 5.5 + Math.random() * 3.5, // 65px - 110px length
          ribbonWidth: 4.5 + Math.random() * 2.5,
          spiralRadius: 7 + Math.random() * 10,
          spiralFrequency: 0.38 + Math.random() * 0.25,
          twistAngle: Math.random() * Math.PI * 2,
          vTwist: (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.04),
          curlPhase: Math.random() * Math.PI * 2,
          curlSpeed: 0.025 + Math.random() * 0.025,
          drag: 0.960,
        });
      } else if (randType < 0.55) {
        // Wavy smooth streamer (微弯波浪纸彩带)
        const segmentCount = 10 + Math.floor(Math.random() * 5);
        particles.push({
          ...base,
          kind: 'wavy_streamer',
          segmentCount,
          segmentLength: 5 + Math.random() * 4,
          ribbonWidth: 4 + Math.random() * 2.5,
          waveAmplitude: 6 + Math.random() * 7,
          waveFrequency: 0.35 + Math.random() * 0.25,
          wavePhase: Math.random() * Math.PI * 2,
          waveSpeed: 0.03 + Math.random() * 0.025,
          drag: 0.962,
        });
      } else if (randType < 0.8) {
        // Short flat rectangular paper strip (普通小纸条)
        particles.push({
          ...base,
          kind: 'strip',
          width: 5 + Math.random() * 3,
          height: 16 + Math.random() * 14,
          drag: 0.968,
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
          drag: 0.972,
        });
      }
    }

    if (!animFrameIdRef.current) {
      loop();
    }
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const gravity = 0.11; // Reduced from 0.26 for slow, airy, weightless ribbon descent
    const fov = 650;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      // 1. Fluid drag & gravity
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + gravity;
      p.vz *= p.drag;

      // 2. Aerodynamic fluttering (纸片飘落微晃)
      p.swayPhase += p.swaySpeed;
      const swayX = Math.sin(p.swayPhase) * p.swayRadius;
      const swayZ = Math.cos(p.swayPhase) * (p.swayRadius * 0.6);

      p.x += p.vx + swayX;
      p.y += p.vy;
      p.z += p.vz + swayZ;

      // 3. 3D Angular tumbling
      p.rx += p.vrx;
      p.ry += p.vry;
      p.rz += p.vrz;

      p.vrx *= 0.998;
      p.vry *= 0.998;
      p.vrz *= 0.998;

      // Opacity fadeout towards end of life (gentle fade in the last 22% of lifetime)
      if (p.life > p.maxLife * 0.78) {
        const remaining = p.maxLife - p.life;
        p.opacity = Math.max(0, remaining / (p.maxLife * 0.22));
      }

      // Cleanup
      if (p.life >= p.maxLife || p.y > window.innerHeight + 150) {
        particles.splice(i, 1);
        continue;
      }

      // ==========================================
      // RENDERING ORDINARY PAPER CONFETTI
      // ==========================================
      const perspective = fov / Math.max(1, fov + p.z);
      const projX = p.x;
      const projY = p.y;

      const cosX = Math.cos(p.rx), sinX = Math.sin(p.rx);
      const cosY = Math.cos(p.ry), sinY = Math.sin(p.ry);
      const cosZ = Math.cos(p.rz), sinZ = Math.sin(p.rz);

      // Helper to rotate local (lx, ly, lz) into world coords
      const rotate3D = (lx3: number, ly3: number, lz3: number) => {
        // Rotate Z
        const x1 = lx3 * cosZ - ly3 * sinZ;
        const y1 = lx3 * sinZ + ly3 * cosZ;
        const z1 = lz3;
        // Rotate X
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        // Rotate Y
        const x3 = x1 * cosY + z2 * sinY;
        const z3 = -x1 * sinY + z2 * cosY;
        return {
          x: projX + x3 * perspective,
          y: projY + y2 * perspective,
          z: p.z + z3,
        };
      };

      ctx.save();
      ctx.globalAlpha = p.opacity;

      if (p.kind === 'spiral_ribbon' || p.kind === 'wavy_streamer') {
        // ============================================================
        // CONTINUOUS PAPER RIBBON (完全消除胶卷横向格线，平滑连贯实心纸条)
        // ============================================================
        if (p.kind === 'spiral_ribbon') {
          p.twistAngle += p.vTwist;
          p.curlPhase += p.curlSpeed;
        } else {
          p.wavePhase += p.waveSpeed;
        }

        const segCount = p.segmentCount;
        const segLen = p.segmentLength;
        const ribWidth = p.ribbonWidth;

        // Compute 3D backbone spine curve nodes
        const leftStrip: { x: number; y: number; z: number }[] = [];
        const rightStrip: { x: number; y: number; z: number }[] = [];

        for (let s = 0; s <= segCount; s++) {
          const t = s / segCount;
          let spineX = 0;
          let spineY = s * segLen - (segCount * segLen) / 2;
          let spineZ = 0;
          let localRoll = 0;

          if (p.kind === 'spiral_ribbon') {
            // Smooth corkscrew spiral ribbon
            const spiralAngle = s * p.spiralFrequency + p.curlPhase;
            const currentRadius = p.spiralRadius * Math.sin(t * Math.PI * 0.8 + 0.2);
            spineX = Math.cos(spiralAngle) * currentRadius;
            spineZ = Math.sin(spiralAngle) * currentRadius * 0.7;
            localRoll = p.twistAngle + s * 0.35;
          } else {
            // Smooth wavy paper streamer
            const waveAngle = s * p.waveFrequency + p.wavePhase;
            spineX = Math.sin(waveAngle) * p.waveAmplitude * (0.5 + t * 0.5);
            spineZ = Math.cos(waveAngle) * (p.waveAmplitude * 0.4);
            localRoll = Math.sin(waveAngle) * 0.6;
          }

          const halfW = ribWidth / 2;
          const rollCos = Math.cos(localRoll);
          const rollSin = Math.sin(localRoll);

          const lxL = spineX - halfW * rollCos;
          const lyL = spineY;
          const lzL = spineZ + halfW * rollSin;

          const lxR = spineX + halfW * rollCos;
          const lyR = spineY;
          const lzR = spineZ - halfW * rollSin;

          leftStrip.push(rotate3D(lxL, lyL, lzL));
          rightStrip.push(rotate3D(lxR, lyR, lzR));
        }

        // Draw seamless continuous paper segments with clean front/back fill (NO transverse grid lines!)
        for (let s = 0; s < segCount; s++) {
          const p0 = leftStrip[s];
          const p1 = rightStrip[s];
          const p2 = rightStrip[s + 1];
          const p3 = leftStrip[s + 1];

          // Face normal Z component to determine paper front vs back
          const ax = p1.x - p0.x, ay = p1.y - p0.y;
          const bx = p3.x - p0.x, by = p3.y - p0.y;
          const nz = ax * by - ay * bx;
          const isFront = nz > 0;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();

          // Matte Paper shading: pure front color or slightly darker shaded underside
          ctx.fillStyle = isFront ? p.color.front : p.color.back;
          ctx.fill();
        }

        // Draw ONLY the continuous outer side edges (longitudinal outline) to give clean paper cut definition
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 0.5;

        // Left long edge
        ctx.beginPath();
        ctx.moveTo(leftStrip[0].x, leftStrip[0].y);
        for (let s = 1; s <= segCount; s++) {
          ctx.lineTo(leftStrip[s].x, leftStrip[s].y);
        }
        ctx.stroke();

        // Right long edge
        ctx.beginPath();
        ctx.moveTo(rightStrip[0].x, rightStrip[0].y);
        for (let s = 1; s <= segCount; s++) {
          ctx.lineTo(rightStrip[s].x, rightStrip[s].y);
        }
        ctx.stroke();

      } else if (p.kind === 'strip') {
        // ============================================================
        // SHORT PAPER STRIP (普通长方形纸条)
        // ============================================================
        const w2 = (p.width * perspective) / 2;
        const h2 = (p.height * perspective) / 2;

        const p0 = rotate3D(-w2, -h2, 0);
        const p1 = rotate3D(w2, -h2, 0);
        const p2 = rotate3D(w2, h2, 0);
        const p3 = rotate3D(-w2, h2, 0);

        const ax = p1.x - p0.x, ay = p1.y - p0.y;
        const bx = p3.x - p0.x, by = p3.y - p0.y;
        const nz = ax * by - ay * bx;
        const isFront = nz > 0;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
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
        const w2 = (p.width * perspective) / 2;
        const h2 = (p.height * perspective) / 2;

        const p0 = rotate3D(-w2, -h2, 0);
        const p1 = rotate3D(w2, -h2, 0);
        const p2 = rotate3D(w2, h2, 0);
        const p3 = rotate3D(-w2, h2, 0);

        const ax = p1.x - p0.x, ay = p1.y - p0.y;
        const bx = p3.x - p0.x, by = p3.y - p0.y;
        const nz = ax * by - ay * bx;
        const isFront = nz > 0;

        if (p.isCircle) {
          // Circular paper dot
          ctx.beginPath();
          const cx = (p0.x + p2.x) / 2;
          const cy = (p0.y + p2.y) / 2;
          const radiusX = Math.hypot(p1.x - p0.x, p1.y - p0.y) / 2;
          const radiusY = Math.hypot(p3.x - p0.x, p3.y - p0.y) / 2;
          const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
          ctx.ellipse(cx, cy, Math.max(0.5, radiusX), Math.max(0.5, radiusY), angle, 0, Math.PI * 2);
          ctx.fillStyle = isFront ? p.color.front : p.color.back;
          ctx.fill();
        } else {
          // Square paper scrap
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
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

  // Helper to safely extract class name string from standard and SVG elements
  const getClassName = (el: Element): string => {
    if (typeof el.className === 'string') {
      return el.className;
    }
    if (el.className && typeof (el.className as any).baseVal === 'string') {
      return (el.className as any).baseVal;
    }
    return el.getAttribute('class') || '';
  };

  // Determine whether an element or any of its ancestors is an interactive/clickable element
  const isInteractiveElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof Element)) return false;

    let curr: Element | null = target;
    let depth = 0;

    const interactiveTags = new Set([
      'BUTTON',
      'A',
      'INPUT',
      'TEXTAREA',
      'SELECT',
      'LABEL',
      'VIDEO',
      'AUDIO',
      'OPTION',
      'NAV',
    ]);

    const interactiveRoles = new Set([
      'button',
      'link',
      'tab',
      'checkbox',
      'switch',
      'menuitem',
      'option',
      'dialog',
      'combobox',
      'slider',
    ]);

    while (curr && depth < 12 && curr !== document.body && curr !== document.documentElement) {
      const tagName = curr.tagName.toUpperCase();
      if (interactiveTags.has(tagName)) {
        return true;
      }

      const role = curr.getAttribute('role');
      if (role && interactiveRoles.has(role.toLowerCase())) {
        return true;
      }

      if (curr.hasAttribute('onclick')) {
        return true;
      }

      const classes = getClassName(curr);
      if (
        classes.includes('cursor-pointer') ||
        classes.includes('cursor-grab') ||
        classes.includes('cursor-grabbing')
      ) {
        return true;
      }

      // Inside modals or drawer panels
      if (
        curr.id === 'mobile-bottom-sheet' ||
        curr.id === 'slide-drawer' ||
        curr.id === 'slide-drawer-package' ||
        curr.id === 'slide-drawer-contents-masked' ||
        curr.id === 'project-modal' ||
        curr.id === 'contact-modal' ||
        classes.includes('z-50')
      ) {
        return true;
      }

      // Check computed style for cursor
      try {
        const cursor = window.getComputedStyle(curr).cursor;
        if (cursor === 'pointer' || cursor === 'grab' || cursor === 'grabbing') {
          return true;
        }
      } catch {
        // ignore detached or cross-origin errors
      }

      curr = curr.parentElement;
      depth++;
    }

    return false;
  };

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

    // Global click/touch listener: trigger burst at click position unless clicking an interactive element
    const handlePointerDown = (e: PointerEvent) => {
      // Only respond to primary button (left mouse button or touch)
      if (e.button !== 0) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      // Prevent triggering on clickable elements (buttons, links, drawer controls, project cards, modals, etc.)
      const target = e.target as Element | null;
      const pointEl = document.elementFromPoint(clientX, clientY);

      if (isInteractiveElement(target) || isInteractiveElement(pointEl)) {
        return;
      }

      spawnBurst(clientX, clientY, 52);
    };

    // Global pointer move listener: show custom confetti popper cursor whenever position is eligible to trigger confetti
    const handlePointerMove = (e: PointerEvent) => {
      // Touch events don't have cursor hover
      if (e.pointerType === 'touch') return;

      const target = e.target as Element | null;
      const pointEl = document.elementFromPoint(e.clientX, e.clientY);

      const isInteractive = isInteractiveElement(target) || isInteractiveElement(pointEl);

      if (isInteractive) {
        if (document.body.classList.contains('confetti-cursor-active')) {
          document.body.classList.remove('confetti-cursor-active');
        }
      } else {
        if (!document.body.classList.contains('confetti-cursor-active')) {
          document.body.classList.add('confetti-cursor-active');
        }
      }
    };

    const handlePointerLeave = () => {
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
      document.body.classList.remove('confetti-cursor-active');
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [spawnBurst]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-40 select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
