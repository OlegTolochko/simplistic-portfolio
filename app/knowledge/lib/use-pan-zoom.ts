"use client";

/**
 * Pan/zoom camera for the knowledge map.
 *
 * Map-style interaction: wheel zooms around the cursor, drag pans, horizontal
 * trackpad gestures pan sideways. `fit` and `focusOn` animate with an ease so
 * the camera never teleports.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type Transform = { x: number; y: number; k: number };
export type Box = { x: number; y: number; w: number; h: number };

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function usePanZoom({
  minK = 0.15,
  maxK = 8,
}: { minK?: number; maxK?: number } = {}) {
  // A callback ref (not useRef) so the listeners attach whenever the host
  // element appears — the consumers render a loading screen first, so the
  // node does not exist on the initial mount.
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const hostRef = useCallback((el: HTMLDivElement | null) => setHost(el), []);
  const [t, setT] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);
  const tRef = useRef(t);
  tRef.current = t;
  const rafRef = useRef<number | null>(null);
  /** True when the last pointer interaction was a drag — lets consumers
   *  ignore the click that follows a pan. */
  const draggedRef = useRef(false);
  const sizeRef = useRef({ w: 1200, h: 800 });
  const [size, setSize] = useState(sizeRef.current);

  useEffect(() => {
    const el = host;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      sizeRef.current = { w: width, h: height };
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    sizeRef.current = { w: rect.width, h: rect.height };
    setSize(sizeRef.current);
    return () => ro.disconnect();
  }, [host]);

  const guardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAnim = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (guardRef.current != null) clearTimeout(guardRef.current);
    rafRef.current = null;
    guardRef.current = null;
  };

  const animateTo = useCallback((to: Transform, ms = 600) => {
    stopAnim();
    const from = { ...tRef.current };
    if (ms <= 0) {
      setT(to);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = easeInOut(p);
      setT({
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        k: from.k + (to.k - from.k) * e,
      });
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
    // Safety net: in a backgrounded or throttled tab rAF may never fire, and
    // the camera would silently stay where it was. Land it anyway.
    guardRef.current = setTimeout(() => {
      if (rafRef.current == null) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setT(to);
    }, ms + 200);
  }, []);

  /** Fit a world-space box into the viewport with padding. */
  const fit = useCallback(
    (box: Box, pad = 60, ms = 600, maxScale = 1.6) => {
      const { w, h } = sizeRef.current;
      if (!w || !h || box.w <= 0 || box.h <= 0) return;
      const k = Math.min(
        maxScale,
        Math.max(minK, Math.min((w - pad * 2) / box.w, (h - pad * 2) / box.h))
      );
      animateTo(
        {
          k,
          x: w / 2 - (box.x + box.w / 2) * k,
          y: h / 2 - (box.y + box.h / 2) * k,
        },
        ms
      );
    },
    [animateTo, minK]
  );

  /** Centre a world-space point, optionally changing zoom. */
  const focusOn = useCallback(
    (wx: number, wy: number, k?: number, ms = 600) => {
      const { w, h } = sizeRef.current;
      const nk = Math.max(minK, Math.min(maxK, k ?? tRef.current.k));
      animateTo({ k: nk, x: w / 2 - wx * nk, y: h / 2 - wy * nk }, ms);
    },
    [animateTo, minK, maxK]
  );

  const zoomBy = useCallback(
    (factor: number, ms = 220) => {
      const { w, h } = sizeRef.current;
      const cur = tRef.current;
      const k = Math.max(minK, Math.min(maxK, cur.k * factor));
      const cx = w / 2;
      const cy = h / 2;
      animateTo(
        {
          k,
          x: cx - ((cx - cur.x) / cur.k) * k,
          y: cy - ((cy - cur.y) / cur.k) * k,
        },
        ms
      );
    },
    [animateTo, minK, maxK]
  );

  /* --------------------------------------------------------- raw handlers */

  useEffect(() => {
    const el = host;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnim();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const cur = tRef.current;

      // Horizontal trackpad swipes pan instead of zooming.
      if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        setT({ ...cur, x: cur.x - e.deltaX, y: cur.y - e.deltaY });
        return;
      }
      const scale = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016));
      const k = Math.max(minK, Math.min(maxK, cur.k * scale));
      setT({
        k,
        x: px - ((px - cur.x) / cur.k) * k,
        y: py - ((py - cur.y) / cur.k) * k,
      });
    };

    let pointerId: number | null = null;
    let last = { x: 0, y: 0 };
    let moved = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-pan]")) return;
      pointerId = e.pointerId;
      last = { x: e.clientX, y: e.clientY };
      moved = false;
      draggedRef.current = false;
      stopAnim();
      el.setPointerCapture(e.pointerId);
      setDragging(true);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        moved = true;
        draggedRef.current = true;
      }
      last = { x: e.clientX, y: e.clientY };
      const cur = tRef.current;
      setT({ ...cur, x: cur.x + dx, y: cur.y + dy });
    };
    const endDrag = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      setDragging(false);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, [host, minK, maxK]);

  // Cancel any in-flight camera animation when the component goes away.
  useEffect(() => () => stopAnim(), []);

  return {
    hostRef,
    transform: t,
    size,
    dragging,
    fit,
    focusOn,
    zoomBy,
    setTransform: setT,
    /** Call inside click handlers: skip the click if it ended a pan. */
    wasDragged: () => draggedRef.current,
  };
}
