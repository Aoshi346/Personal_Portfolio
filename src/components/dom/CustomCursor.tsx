import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches
  );

  useEffect(() => {
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Tell GSAP to treat this position as the exact center of the div
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    let activeTarget: HTMLElement | null = null;
    let targetRect: DOMRect | null = null;
    let computedStyle: CSSStyleDeclaration | null = null;
    let lastX = 0;
    let lastY = 0;

    const moveCursor = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (activeTarget && targetRect && computedStyle) {
        // True Magnetic Snapping
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        
        // How far is the mouse from the actual center of the button?
        const relX = e.clientX - targetCenterX;
        const relY = e.clientY - targetCenterY;
        
        // Snap the cursor squarely onto the button center, but dynamically pull it up to 15% towards the mouse location for an elastic parallax feel
        gsap.to(cursor, {
          x: targetCenterX + relX * 0.15,
          y: targetCenterY + relY * 0.15,
          width: targetRect.width + 16, // Wrap slightly outside the button
          height: targetRect.height + 16,
          borderRadius: computedStyle.borderRadius || "8px",
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderColor: "transparent",
          duration: 0.2, // Snappy entry
          ease: 'power2.out',
        });
      } else {
        // Normal smooth follow (default circle)
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "transparent",
          borderColor: "rgba(255, 255, 255, 0.8)",
          duration: 0.15,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let isClickable = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer') as HTMLElement | null;

      // Exclusion protocol: opt-out elements inside .no-cursor-snap are ignored
      if (isClickable && isClickable.closest('.no-cursor-snap')) { isClickable = null; }

      if (isClickable) {
        activeTarget = isClickable;
        targetRect = isClickable.getBoundingClientRect();
        computedStyle = window.getComputedStyle(isClickable);
      }
    };

    const handleMouseOut = () => {
      activeTarget = null;
      targetRect = null;
      computedStyle = null;
    };

    // Update bounding rectangle dynamically on scroll
    const handleScroll = () => {
      if (activeTarget) {
        targetRect = activeTarget.getBoundingClientRect();
        
        // Check if cursor is still physically over the target after scroll
        const elementAtPoint = document.elementFromPoint(lastX, lastY) as HTMLElement;
        let stillHovering = elementAtPoint?.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer') as HTMLElement | null;

        // Exclusion protocol: same no-cursor-snap check as handleMouseOver
        if (stillHovering && stillHovering.closest('.no-cursor-snap')) { stillHovering = null; }

        if (!stillHovering || stillHovering !== activeTarget) {
          activeTarget = null;
          targetRect = null;
          computedStyle = null;
        }

        // Force a fake mousemove to recalculate position relative to the new scroll offset
        const dummyEvent = { clientX: lastX, clientY: lastY } as MouseEvent;
        moveCursor(dummyEvent);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) {
    return null; // Disabled visually and computationally on mobile phones
  }

  // NOTE: I completely removed Tailwind CSS 'transition-all' from className because it severely lags and conflicts with GSAP driving standard CSS properties like width/backgroundColor at 60fps!
  return (
    <>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          body { cursor: none; }
          a, button, [role="button"], input, select, textarea, .cursor-pointer { cursor: none !important; }
        }
      `}</style>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] mix-blend-difference will-change-transform"
        style={{
          width: 32,
          height: 32,
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          backgroundColor: 'transparent'
        }}
      />
    </>
  );
}
