import React, { useState, useEffect } from 'react';

/**
 * Focus Ruler Mask Component:
 * Projects a horizontal reading spotlight following the user's cursor or touch,
 * darkening extraneous lines to prevent visual crowding and skipping.
 * pointer-events: none ensures underlying text tokens remain fully clickable!
 */
export function FocusRuler({
  enabled = true,
  height = 70, // pixel height of the illuminated reading slot
  containerRef = null,
}) {
  const [mouseY, setMouseY] = useState(250);
  const [isInside, setIsInside] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (e) => {
      // If bound to a container, calculate relative position
      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right
        ) {
          setIsInside(true);
          setMouseY(e.clientY);
        } else {
          // Keep active or gracefully fade
          setIsInside(false);
        }
      } else {
        setIsInside(true);
        setMouseY(e.clientY);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0]);
      }
    }, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [enabled, containerRef]);

  if (!enabled) return null;

  const half = height / 2;
  const topEdge = Math.max(0, mouseY - half);
  const bottomEdge = mouseY + half;

  return (
    <div
      className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-300 ${
        isInside ? 'opacity-100' : 'opacity-30'
      }`}
      aria-hidden="true"
    >
      {/* Upper Dimming Curtain */}
      <div
        className="absolute top-0 left-0 right-0 bg-slate-950/65 backdrop-blur-[1px] transition-all duration-75"
        style={{ height: `${topEdge}px` }}
      />

      {/* Clear Active Reading Band with subtle glowing laser guides */}
      <div
        className="absolute left-0 right-0 border-y border-cyan-400/35 bg-cyan-400/[0.02] shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-75"
        style={{
          top: `${topEdge}px`,
          height: `${height}px`,
        }}
      >
        {/* Subtle Edge Guides */}
        <div className="absolute top-0 left-6 w-12 h-1 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400/50" />
        <div className="absolute bottom-0 left-6 w-12 h-1 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400/50" />
        <div className="absolute top-0 right-6 w-12 h-1 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400/50" />
        <div className="absolute bottom-0 right-6 w-12 h-1 bg-cyan-400/80 rounded-full shadow-sm shadow-cyan-400/50" />
      </div>

      {/* Lower Dimming Curtain */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-slate-950/65 backdrop-blur-[1px] transition-all duration-75"
        style={{ top: `${bottomEdge}px` }}
      />
    </div>
  );
}
