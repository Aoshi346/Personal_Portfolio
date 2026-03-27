import { useEffect, useRef } from "react";
import gsap from "gsap";

export const MagneticButton = ({
  children,
  href,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const xToRef = useRef<((value: number) => void) | null>(null);
  const yToRef = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    xToRef.current = gsap.quickTo(contentRef.current, "x", {
      duration: 0.16,
      ease: "power4.out",
    });
    yToRef.current = gsap.quickTo(contentRef.current, "y", {
      duration: 0.16,
      ease: "power4.out",
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || !contentRef.current) return;
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
    xToRef.current?.(x);
    yToRef.current?.(y);
  };

  const handleMouseLeave = () => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      x: 0,
      y: 0,
      duration: 0.28,
      ease: "back.out(1.8)",
    });
  };

  return (
    <a
      ref={rootRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group p-4 -m-4 ${className}`}
      {...props}
    >
      <div
        ref={contentRef}
        className="flex items-center gap-2 pointer-events-none"
      >
        {children}
      </div>
    </a>
  );
};
