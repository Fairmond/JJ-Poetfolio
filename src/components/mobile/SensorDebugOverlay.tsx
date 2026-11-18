import React, { useEffect, useRef, useState } from 'react';
import { ParallaxCoords } from '../../hooks/useParallax';

interface SensorDebugOverlayProps {
  renderPos: ParallaxCoords;
  isLoading: boolean;
}

interface DebugSnapshot {
  secure: boolean;
  inIframe: boolean;
  isLoaded: boolean;
  hasDOE: boolean;
  hasDME: boolean;
  hasReqPerm: boolean;
  hasROS: boolean;
  hasGS: boolean;
  permGyro: string;
  permAccel: string;
  oriCount: number;
  oriVal: string;
  oriChanging: boolean;
  absCount: number;
  absVal: string;
  motCount: number;
  motAcc: string;
  motRot: string;
  rosStatus: string;
  gsStatus: string;
  reqPermStatus: string;
  ua: string;
}

function fmtNum(n: number | null | undefined, digits = 1): string {
  return typeof n === 'number' && !Number.isNaN(n) ? n.toFixed(digits) : 'null';
}

export const SensorDebugOverlay: React.FC<SensorDebugOverlayProps> = ({
  renderPos,
  isLoading,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const [snap, setSnap] = useState<DebugSnapshot>(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {};
    const doe = typeof DeviceOrientationEvent !== 'undefined'
      ? (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      : undefined;
    return {
      secure: typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false,
      inIframe: typeof window !== 'undefined' ? window.top !== window.self : false,
      isLoaded: !isLoading,
      hasDOE: typeof DeviceOrientationEvent !== 'undefined',
      hasDME: typeof DeviceMotionEvent !== 'undefined',
      hasReqPerm: Boolean(doe && typeof doe.requestPermission === 'function'),
      hasROS: Boolean(win.RelativeOrientationSensor),
      hasGS: Boolean(win.GravitySensor),
      permGyro: 'unknown',
      permAccel: 'unknown',
      oriCount: 0,
      oriVal: 'none',
      oriChanging: false,
      absCount: 0,
      absVal: 'none',
      motCount: 0,
      motAcc: 'none',
      motRot: 'none',
      rosStatus: win.RelativeOrientationSensor ? 'pending' : 'unsupported',
      gsStatus: win.GravitySensor ? 'pending' : 'unsupported',
      reqPermStatus: doe && typeof doe.requestPermission === 'function' ? 'idle(tap)' : 'n/a',
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
  });

  const liveRef = useRef<DebugSnapshot>(snap);
  const isLoadingRef = useRef<boolean>(isLoading);
  isLoadingRef.current = isLoading;
  liveRef.current.isLoaded = !isLoading;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mounted = true;
    let firstOri: [number, number, number] | null = null;

    const patch = (partial: Partial<DebugSnapshot>) => {
      Object.assign(liveRef.current, partial);
    };

    // Query Permissions API if supported
    const perms = (navigator as unknown as { permissions?: { query: (d: { name: string }) => Promise<{ state: string }> } }).permissions;
    if (perms && typeof perms.query === 'function') {
      perms.query({ name: 'gyroscope' }).then((r) => patch({ permGyro: r.state })).catch((e) => patch({ permGyro: `err:${e?.name || 'unsupported'}` }));
      perms.query({ name: 'accelerometer' }).then((r) => patch({ permAccel: r.state })).catch((e) => patch({ permAccel: `err:${e?.name || 'unsupported'}` }));
    }

    const onOri = (e: DeviceOrientationEvent) => {
      const nextCount = liveRef.current.oriCount + 1;
      const oriVal = `${fmtNum(e.alpha)}, ${fmtNum(e.beta)}, ${fmtNum(e.gamma)}`;
      let oriChanging = liveRef.current.oriChanging;
      if (typeof e.beta === 'number' && typeof e.gamma === 'number') {
        const a = typeof e.alpha === 'number' ? e.alpha : 0;
        if (!firstOri) {
          firstOri = [a, e.beta, e.gamma];
        } else if (
          Math.abs(a - firstOri[0]) + Math.abs(e.beta - firstOri[1]) + Math.abs(e.gamma - firstOri[2]) > 0.05
        ) {
          oriChanging = true;
        }
      }
      patch({ oriCount: nextCount, oriVal, oriChanging });
    };

    const onAbs = (e: Event) => {
      const oe = e as DeviceOrientationEvent;
      patch({
        absCount: liveRef.current.absCount + 1,
        absVal: `${fmtNum(oe.alpha)}, ${fmtNum(oe.beta)}, ${fmtNum(oe.gamma)}`,
      });
    };

    const onMot = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      const r = e.rotationRate;
      patch({
        motCount: liveRef.current.motCount + 1,
        motAcc: a ? `${fmtNum(a.x)}, ${fmtNum(a.y)}, ${fmtNum(a.z)}` : 'null',
        motRot: r ? `${fmtNum(r.alpha)}, ${fmtNum(r.beta)}, ${fmtNum(r.gamma)}` : 'null',
      });
    };

    window.addEventListener('deviceorientation', onOri, false);
    window.addEventListener('deviceorientationabsolute', onAbs, false);
    window.addEventListener('devicemotion', onMot, false);

    // Probe W3C Generic Sensors independently for error diagnostics
    interface SensorLike {
      start: () => void;
      stop: () => void;
      addEventListener: (t: string, cb: (ev?: unknown) => void) => void;
      quaternion?: number[];
      x?: number;
      y?: number;
      z?: number;
    }
    type SensorCtor = new (opts?: { frequency?: number }) => SensorLike;
    const win = window as unknown as Record<string, SensorCtor | undefined>;
    let rosSensor: SensorLike | null = null;
    let gsSensor: SensorLike | null = null;

    if (win.RelativeOrientationSensor) {
      try {
        rosSensor = new win.RelativeOrientationSensor({ frequency: 15 });
        let rosCnt = 0;
        rosSensor.addEventListener('reading', () => {
          rosCnt++;
          const q = rosSensor?.quaternion;
          patch({
            rosStatus: q ? `ok(#${rosCnt}) ${q.map((v) => v.toFixed(2)).join(',')}` : `ok(#${rosCnt})`,
          });
        });
        rosSensor.addEventListener('error', (ev: unknown) => {
          const err = (ev as { error?: { name?: string; message?: string } })?.error;
          patch({ rosStatus: `err:${err?.name || 'unknown'} ${err?.message || ''}`.trim() });
        });
        rosSensor.start();
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        patch({ rosStatus: `throw:${e?.name || 'err'} ${e?.message || ''}`.trim() });
      }
    }

    if (win.GravitySensor) {
      try {
        gsSensor = new win.GravitySensor({ frequency: 15 });
        let gsCnt = 0;
        gsSensor.addEventListener('reading', () => {
          gsCnt++;
          patch({
            gsStatus: `ok(#${gsCnt}) ${fmtNum(gsSensor?.x)},${fmtNum(gsSensor?.y)},${fmtNum(gsSensor?.z)}`,
          });
        });
        gsSensor.addEventListener('error', (ev: unknown) => {
          const err = (ev as { error?: { name?: string; message?: string } })?.error;
          patch({ gsStatus: `err:${err?.name || 'unknown'} ${err?.message || ''}`.trim() });
        });
        gsSensor.start();
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        patch({ gsStatus: `throw:${e?.name || 'err'} ${e?.message || ''}`.trim() });
      }
    }

    const timer = window.setInterval(() => {
      if (mounted) {
        setSnap({ ...liveRef.current, isLoaded: !isLoadingRef.current });
      }
    }, 200);

    return () => {
      mounted = false;
      window.clearInterval(timer);
      window.removeEventListener('deviceorientation', onOri, false);
      window.removeEventListener('deviceorientationabsolute', onAbs, false);
      window.removeEventListener('devicemotion', onMot, false);
      try { rosSensor?.stop(); } catch { /* ignore */ }
      try { gsSensor?.stop(); } catch { /* ignore */ }
    };
  }, []);

  const handleManualRequest = () => {
    const doe = typeof DeviceOrientationEvent !== 'undefined'
      ? (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      : undefined;
    if (doe && typeof doe.requestPermission === 'function') {
      liveRef.current.reqPermStatus = 'requesting...';
      doe.requestPermission()
        .then((res) => {
          liveRef.current.reqPermStatus = `res:${res}`;
          setSnap({ ...liveRef.current });
        })
        .catch((err) => {
          liveRef.current.reqPermStatus = `err:${err?.name || err}`;
          setSnap({ ...liveRef.current });
        });
    } else {
      liveRef.current.reqPermStatus = 'no-api(android)';
      setSnap({ ...liveRef.current });
    }
  };

  const handleCopy = () => {
    const report = {
      ...snap,
      renderPos: {
        x: Number(renderPos.x.toFixed(4)),
        y: Number(renderPos.y.toFixed(4)),
      },
      href: typeof window !== 'undefined' ? window.location.href : '',
    };
    const text = JSON.stringify(report, null, 2);
    const markCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          markCopied();
        } catch {
          /* ignore */
        }
        ta.remove();
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        markCopied();
      } catch {
        /* ignore */
      }
      ta.remove();
    }
  };

  const diagnoseSummary = () => {
    if (!snap.secure) return '❌ 非HTTPS安全上下文，传感器被禁止';
    if (snap.oriChanging) return '✅ deviceorientation 实时数据正常';
    if (snap.oriCount > 0 && !snap.oriChanging) return '⚠️ orientation 有事件但数值不动/全null';
    if (snap.motCount > 0 && snap.motAcc !== 'null') return '⚠️ 无orientation，仅devicemotion有加速度';
    if (snap.motCount > 0 && snap.motRot !== 'null') return '⚠️ 仅rotationRate有角速度(acc为null)';
    if (snap.rosStatus.startsWith('ok') || snap.gsStatus.startsWith('ok')) return '✅ GenericSensor 有读数';
    if (snap.hasReqPerm && snap.reqPermStatus.includes('idle')) return '⏳ iOS等待点击触发requestPermission';
    return '❌ 传感器事件全部为0（被浏览器/系统/iframe拦截）';
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed top-2 right-2 z-[9999] px-2.5 py-1 rounded bg-black/80 text-[#00ff88] text-[11px] font-mono shadow-lg border border-white/15"
      >
        传感诊断 ({snap.oriCount}/{snap.motCount})
      </button>
    );
  }

  return (
    <div
      className="fixed top-2 left-2 right-2 z-[9999] max-w-[440px] mx-auto rounded-lg bg-black/85 text-neutral-100 text-[11px] leading-[1.4] font-mono p-2.5 shadow-2xl border border-white/15 select-text"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/15">
        <span className="font-bold text-[#00ff88] truncate">{diagnoseSummary()}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white text-[10px]"
          >
            {copied ? '已复制' : '复制'}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white text-[10px]"
          >
            收起
          </button>
        </div>
      </div>

      <div className="space-y-0.5 break-all text-[10.5px]">
        <div>
          <span className="text-neutral-400">环境: </span>
          HTTPS={String(snap.secure)} | iframe={String(snap.inIframe)} | loaded={String(snap.isLoaded)}
        </div>
        <div>
          <span className="text-neutral-400">权限API: </span>
          gyro={snap.permGyro} | accel={snap.permAccel} | reqPerm={snap.reqPermStatus}
        </div>
        <div>
          <span className="text-neutral-400">orientation(#{snap.oriCount}): </span>
          <span className={snap.oriChanging ? 'text-[#00ff88]' : 'text-amber-300'}>
            [{snap.oriVal}] {snap.oriChanging ? '(变化中)' : '(未变)'}
          </span>
        </div>
        <div>
          <span className="text-neutral-400">absOri(#{snap.absCount}): </span>
          [{snap.absVal}]
        </div>
        <div>
          <span className="text-neutral-400">motion(#{snap.motCount}): </span>
          acc=[{snap.motAcc}] | rot=[{snap.motRot}]
        </div>
        <div>
          <span className="text-neutral-400">ROS / GS: </span>
          {snap.rosStatus} | {snap.gsStatus}
        </div>
        <div>
          <span className="text-neutral-400">视差输出 renderPos: </span>
          <span className="text-cyan-300">
            x={renderPos.x.toFixed(3)}, y={renderPos.y.toFixed(3)}
          </span>
        </div>
      </div>

      {snap.hasReqPerm && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex gap-2">
          <button
            type="button"
            onClick={handleManualRequest}
            className="px-2 py-0.5 rounded bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40 text-[10px]"
          >
            手动请求 iOS 传感器权限
          </button>
        </div>
      )}
    </div>
  );
};
