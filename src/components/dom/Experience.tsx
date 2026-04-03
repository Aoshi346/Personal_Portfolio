import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Database, Terminal, Code2, Network, Blocks, Globe, Palette, Binary, type LucideIcon } from "lucide-react";
import { Language, translations } from "../../constants/translations";
import { scrambleText } from "../../utils/textEffects";

gsap.registerPlugin(ScrollTrigger);

const ROLE_STACK: string[][] = [
  ["Algorithms", "SQL", "C++", "Python", "Architecture"],
  ["Django", "React", "TypeScript", "Linux", "SQL"],
  ["React", "Next.js", "Django", "REST", "Tailwind"],
];

const SKILL_ICONS: Record<string, LucideIcon> = {
  "Algorithms": Binary,
  "SQL": Database,
  "C++": Terminal,
  "Python": Terminal,
  "Architecture": Network,
  "Django": Blocks,
  "React": Code2,
  "TypeScript": Code2,
  "Linux": Terminal,
  "Next.js": Code2,
  "REST": Globe,
  "Tailwind": Palette,
};

const MagneticElement = ({
  children,
  className = "",
  onHoverAction,
  radius = 44,
  strength = 0.38,
}: {
  children: React.ReactNode;
  className?: string;
  onHoverAction?: () => void;
  radius?: number;
  strength?: number;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);

    if (Math.hypot(dx, dy) < radius) {
      gsap.to(innerRef.current, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.26,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(innerRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1,0.4)",
        overwrite: "auto",
      });
    }
  }, [radius, strength]);

  const onEnter = useCallback(() => {
    if (onHoverAction) onHoverAction();
  }, [onHoverAction]);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1,0.4)",
      overwrite: "auto",
    });
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
    >
      <div ref={innerRef} className="origin-center">
        {children}
      </div>
    </div>
  );
};

interface ExperienceProps {
  language: Language;
  onActive?: () => void;
}

export const Experience = ({ language, onActive }: ExperienceProps) => {
  const t = translations[language].sections;

  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const onActiveRef = useRef(onActive);
  const activeCalledRef = useRef(false);

  useLayoutEffect(() => {
    onActiveRef.current = onActive;
  }, [onActive]);

  const fireOnActive = useCallback(() => {
    if (!activeCalledRef.current) {
      activeCalledRef.current = true;
      onActiveRef.current?.();
    }
  }, []);

  const triggerGlobalPulse = useCallback(() => {
    gsap.fromTo(
      ".ghost-border",
      { strokeWidth: 3, filter: "drop-shadow(0 0 10px rgba(143,245,255,0.8))", opacity: 0.9 },
      {
        strokeWidth: 1.5,
        filter: "none",
        opacity: 0.35,
        duration: 1.4,
        ease: "power4.out",
        stagger: 0.1,
        overwrite: "auto",
      }
    );
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    let tlPrimary: gsap.core.Timeline | null = null;
    const mm = gsap.matchMedia();

    // ── Pre-boot Initial States ───────────────────────────────────────────────
    // Title starts as an outline (transparent fill, cyan stroke)
    gsap.set(titleRef.current, { 
      yPercent: 110, 
      color: "transparent", 
      webkitTextStroke: "1px var(--primary)" 
    });
    gsap.set(tagRef.current, { autoAlpha: 0, y: 20 });
    gsap.set(titleWrapRef.current, { transformOrigin: "left center" });

    const hudBrackets = sectionRef.current.querySelectorAll(".title-hud-bracket");
    gsap.set(hudBrackets, { opacity: 0, scale: 0.8 });

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const body = card.querySelectorAll(".card-body > *");
      const badges = card.querySelectorAll(".skill-badge");

      gsap.set(body, { opacity: 0, y: 30 });
      gsap.set(badges, { autoAlpha: 0, y: 20 });
      gsap.set(card, { opacity: 0.35, scale: 0.95, filter: "blur(4px)" });
    });

    // ── Desktop (1024px+): High-Performance Pinned Horizontal Scroll ───────────
    mm.add("(min-width: 1024px)", () => {
      const container = scrollContainerRef.current!;
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

      const getScrollAmount = () => -(container.scrollWidth - window.innerWidth);
      const getEndOffset = () => `+=${container.scrollWidth * 1.5}`;

      tlPrimary = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: getEndOffset,
          pin: true,
          pinSpacing: true,
          scrub: 1.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onEnter: fireOnActive,
          onEnterBack: fireOnActive,
        },
      });

      // ── Phase 2: The Departure (Stage-Clear) ──────────────────────────────
      // Title fades and scales to 0 to completely vacate the screen
      tlPrimary.to(
        titleWrapRef.current,
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.15, // Handover in first 15% of timeline
          ease: "power2.inOut",
        },
        0
      );

      // HUD Brackets fade out completely as the title recesses
      tlPrimary.to(
        hudBrackets,
        { opacity: 0, scale: 1.2, duration: 0.15, ease: "power2.out" },
        0
      );

      // ── Horizontal Translation ─────────────────────────────────────────────
      tlPrimary.to(container, { x: getScrollAmount, ease: "none" }, 0);

      // ── Phase 1: The Entrance (Scramble Hook) ──────────────────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        once: true,
        onEnter: () => {
          gsap.to(hudBrackets, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" });
          gsap.to(tagRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" });
          
          gsap.to(titleRef.current, {
            yPercent: 0,
            duration: 1.0,
            ease: "power4.out",
            onComplete: () => {
              if (titleRef.current) {
                // Scramble the text
                scrambleText(titleRef.current);
                // The "Outline-to-Solid" Power-On fill
                gsap.to(titleRef.current, {
                  color: "#ffffff",
                  webkitTextStroke: "0px transparent",
                  duration: 0.8,
                  ease: "power2.inOut",
                  delay: 0.4, // Wait for scramble to finish
                });
              }
            },
          });
        },
      });

      // ── Skew & Compression Physics ──────────────────────────────────────────
      const proxy = { skew: 0, scaleX: 1 };
      const skewSetter = gsap.quickSetter(cards, "skewX", "deg");
      const scaleXSetter = gsap.quickSetter(cards, "scaleX");
      const clamp = gsap.utils.clamp(-4, 4);
      const clampSX = gsap.utils.clamp(0.98, 1);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: getEndOffset,
        onUpdate: (self) => {
          const raw = self.getVelocity() / -250;
          const skewVal = clamp(raw);
          const scaleVal = clampSX(1 - Math.abs(raw) * 0.002);

          if (Math.abs(skewVal) > 0.05) {
            gsap.to(proxy, {
              skew: skewVal,
              scaleX: scaleVal,
              overwrite: true,
              duration: 0.1,
              onUpdate: () => {
                skewSetter(proxy.skew);
                scaleXSetter(proxy.scaleX);
              },
            });
            gsap.to(proxy, {
              skew: 0,
              scaleX: 1,
              delay: 0.1,
              duration: 0.8,
              ease: "power3.out",
              onUpdate: () => {
                skewSetter(proxy.skew);
                scaleXSetter(proxy.scaleX);
              },
            });
          }
        },
      });

      const cleanups: (() => void)[] = [];

      // ── DOF & Hardware Initialization ──────────────────────────────────────
      cards.forEach((card) => {
        const body = card.querySelectorAll(".card-body > *");
        const badges = card.querySelectorAll(".skill-badge");
        const inner = card.querySelector(".card-inner") as HTMLDivElement;

        // ── Spotlight & Tilt Hover Effect ──
        if (inner) {
          const setX = gsap.quickTo(inner, "rotationY", { ease: "power3", duration: 0.5 });
          const setY = gsap.quickTo(inner, "rotationX", { ease: "power3", duration: 0.5 });
          
          const onMove = (e: MouseEvent) => {
            if (!window.matchMedia("(hover: hover)").matches) return;
            const rect = inner.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            inner.style.setProperty("--mouse-x", `${x}px`);
            inner.style.setProperty("--mouse-y", `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            setX(((x - centerX) / centerX) * 2);
            setY(((y - centerY) / centerY) * -2);
          };

          const onLeave = () => {
            if (!window.matchMedia("(hover: hover)").matches) return;
            setX(0);
            setY(0);
          };

          inner.addEventListener("mousemove", onMove);
          inner.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            inner.removeEventListener("mousemove", onMove);
            inner.removeEventListener("mouseleave", onLeave);
          });
        }

        ScrollTrigger.create({
          trigger: card,
          containerAnimation: tlPrimary!,
          start: "left 75%",
          end: "right 25%",
          onEnter: () => {
            gsap.to(body, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", delay: 0.1 });
            gsap.to(badges, {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.05,
              ease: "power3.out",
              delay: 0.45,
            });
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              boxShadow: "0 0 80px rgba(143,245,255,0.05)",
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power3.out",
            });
          },
          onLeave: () => {
            gsap.to(card, { opacity: 0.35, scale: 0.95, boxShadow: "none", filter: "blur(4px)", duration: 0.5, ease: "power2.in" });
          },
          onEnterBack: () => {
            gsap.to(card, { opacity: 1, scale: 1, boxShadow: "0 0 80px rgba(143,245,255,0.05)", filter: "blur(0px)", duration: 0.6, ease: "power3.out" });
          },
          onLeaveBack: () => {
             gsap.to(card, { opacity: 0.35, scale: 0.95, boxShadow: "none", filter: "blur(4px)", duration: 0.5, ease: "power2.in" });
          },
        });
      });

      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        cleanups.forEach(fn => fn());
      };
    });

    // ── Mobile: Vertical Cinematic Slide (<1024px) ───────────────────────────
    mm.add("(max-width: 1023px)", () => {
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

      gsap.set(cards, { opacity: 1, scale: 1, filter: "blur(0px)" });
      gsap.set(titleWrapRef.current, { opacity: 1, scale: 1, xPercent: 0 });

      // Title Initial Entrance
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(tagRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
          gsap.to(titleRef.current, {
            yPercent: 0,
            duration: 0.9,
            ease: "power4.out",
            onComplete: () => {
              if (titleRef.current) {
                scrambleText(titleRef.current);
                gsap.to(titleRef.current, { color: "#ffffff", webkitTextStroke: "0px transparent", duration: 0.8, delay: 0.4 });
              }
            },
          });
        },
      });

      // Phase 3: Mobile Title — fully clear the stage as first card hits center
      // Fades to opacity 0 and translates upward so cards can dominate the viewport
      const firstCard = cards[0];
      if (firstCard) {
        ScrollTrigger.create({
          trigger: firstCard,
          start: "center 75%", // title starts exiting when first card is halfway up
          end: "center 40%",   // fully gone by the time card hits upper third
          scrub: true,
          animation: gsap.fromTo(
            titleWrapRef.current,
            { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
            { opacity: 0, y: -40, filter: "blur(8px)", scale: 0.95, ease: "none" }
          ),
        });
      }

      // Phase 2: Center-Focus "Depth of Field" — cinematic vertical carousel effect
      // Each card starts dimmed/blurred and scales into focus as it hits the viewport center
      cards.forEach((card) => {
        const body = card.querySelectorAll(".card-body > *");
        const badges = card.querySelectorAll(".skill-badge");

        // ── One-time entrance: reveal body text & badges when card first scrolls in ──
        ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.to(body, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.1 });
            gsap.to(badges, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out", delay: 0.4 });
          },
        });

        // ── Scrubbed Center-Focus DOF: off-center = dim/blur, center = sharp/vivid ──
        gsap.set(card, { scale: 0.95, opacity: 0.4, filter: "blur(2px)" });

        ScrollTrigger.create({
          trigger: card,
          start: "center 80%",  // card center enters focus zone from the bottom
          end: "center 20%",   // card center exits focus zone off the top
          scrub: true,
          toggleActions: "play reverse play reverse",
          onUpdate: (self) => {
            // progress 0→0.5 = coming into focus, 0.5→1 = leaving focus
            const p = self.progress;
            // peak sharpness at progress 0.5 (card dead-center in viewport)
            const focusCurve = 1 - Math.abs(p - 0.5) * 2; // 0 at edges, 1 at center
            const scale = 0.95 + focusCurve * 0.05;         // 0.95 → 1.0
            const opacity = 0.4 + focusCurve * 0.6;          // 0.4  → 1.0
            const blur = (1 - focusCurve) * 2;               // 2px  → 0px
            const shadow = focusCurve > 0.8
              ? `0 0 80px rgba(143,245,255,${(focusCurve - 0.8) * 0.25})`
              : "none";

            gsap.set(card, { scale, opacity, filter: `blur(${blur}px)`, boxShadow: shadow });
          },
        });
      });

      return () => {};
    });

    return () => mm.revert();
  }, [fireOnActive]);

  return (
    <section
      ref={sectionRef}
      id="section-2"
      className="relative w-full min-h-[100dvh] lg:h-[100dvh] bg-[#0b0e14] lg:overflow-hidden flex flex-col lg:flex-row lg:items-center"
      style={{ willChange: "transform" }}
    >
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }
        @keyframes pulse-bracket {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; filter: drop-shadow(0 0 4px var(--primary)); }
        }
        .hud-ping-1 { animation: pulse-bracket 2s ease-in-out infinite; }
        .hud-ping-2 { animation: pulse-bracket 2s ease-in-out infinite 0.5s; }
        .hud-ping-3 { animation: pulse-bracket 2s ease-in-out infinite 1s; }
        .hud-ping-4 { animation: pulse-bracket 2s ease-in-out infinite 1.5s; }
      `}</style>

      {/* ── Title Block Stage-Gate (Phase 1 & Phase 3) ────────────────────── */}
      <div
        ref={titleBlockRef}
        className="sticky lg:absolute top-16 lg:top-1/2 lg:-translate-y-1/2 left-0 lg:left-24 z-0 px-8 pt-12 pb-6 lg:px-0 lg:pt-0 pointer-events-none"
      >
        {/* titleWrapRef is what actually scales and fades, so mobile blur applies correctly */}
        <div ref={titleWrapRef} style={{ willChange: "transform, opacity, filter" }} className="relative">
          
          {/* Telemetry HUD Brackets */}
          <div className="title-hud-bracket hud-ping-1 absolute -top-4 -left-6 lg:-left-8 w-4 h-4 border-t-2 border-l-2 border-[var(--primary)] pointer-events-none" />
          <div className="title-hud-bracket hud-ping-2 absolute -top-4 -right-2 lg:-right-8 w-4 h-4 border-t-2 border-r-2 border-[var(--primary)] pointer-events-none" />
          <div className="title-hud-bracket hud-ping-3 absolute -bottom-4 -left-6 lg:-left-8 w-4 h-4 border-b-2 border-l-2 border-[var(--primary)] pointer-events-none" />
          <div className="title-hud-bracket hud-ping-4 absolute -bottom-4 -right-2 lg:-right-8 w-4 h-4 border-b-2 border-r-2 border-[var(--primary)] pointer-events-none" />

          <MagneticElement onHoverAction={triggerGlobalPulse}>
            <div
              ref={tagRef}
              className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                         bg-[var(--secondary)]/10 border border-[var(--secondary)]/20
                         text-[var(--secondary)] text-[10px] md:text-xs font-bold tracking-[0.2em]
                         uppercase badge-font backdrop-blur-md pointer-events-auto"
            >
              <Briefcase size={14} /> {t.experience.tag}
            </div>
          </MagneticElement>

          <h2 className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter badge-font drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <div className="overflow-hidden pb-4">
              <span
                ref={titleRef}
                className="block uppercase italic"
                data-final-text={t.experience.title}
                style={{
                  // The solid fill transition is handled via GSAP onComplete
                  willChange: "color, -webkit-text-stroke",
                }}
              >
                {t.experience.title}
              </span>
            </div>
          </h2>

        </div>
      </div>

      {/* ── Horizontal Modules Track (Phase 2 & Center Focus) ───────────── */}
      {/* 
        Z-Index: 10 ensures cards float strictly ON TOP of the recessed watermark title.
        pl-[50vw] on desktop forces the first card to wait entirely off-screen
        until the user begins scrubbing, allowing the watermark transition to execute beautifully.
      */}
      <div
        ref={scrollContainerRef}
        className="flex flex-col lg:flex-row flex-nowrap
                   gap-10 lg:gap-[6vw]
                   px-8 lg:pl-[100vw] lg:pr-[25vw]
                   pb-24 lg:pb-0
                   w-full lg:w-max
                   lg:h-[76vh] lg:items-center
                   relative z-10"
        style={{ willChange: "transform" }}
      >
        {t.experience.roles.map((item, i) => {
          const stack = ROLE_STACK[i] ?? [];
          return (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="flex-none w-full lg:w-[clamp(340px,46vw,600px)] h-auto lg:h-[clamp(480px,74vh,840px)] transform-gpu cursor-default relative group"
              style={{
                transformOrigin: "center center",
                willChange: "transform, opacity, filter",
                perspective: "1200px",
              }}
            >
              <div
                className="card-inner relative w-full h-full flex flex-col rounded-[28px] bg-[#0d1117] border border-white/10"
                style={{
                  willChange: "transform",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Spotlight Background */}
                <div
                  className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[28px] overflow-hidden"
                  style={{
                    background: "radial-gradient(circle 500px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255,255,255,0.06) 0%, transparent 60%)",
                  }}
                />

                {/* Border Glow Mask */}
                <div
                  className="pointer-events-none absolute inset-[-1px] z-10 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(circle 300px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255,255,255,0.2) 0%, transparent 70%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    padding: "1px",
                  }}
                />

                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-[28px] overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}
                />

                <div className="card-body relative z-[15] flex flex-col h-full p-6 sm:p-8 lg:p-12 gap-6">
                  <div className="self-start mt-2">
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                 bg-white/[0.03] text-white/70
                                 border border-white/10
                                 text-[10px] lg:text-[11px] tracking-[0.2em] font-bold uppercase badge-font
                                 select-none cursor-default"
                    >
                      {item.company}
                    </div>
                  </div>

                  <h3
                    className="text-5xl lg:text-[2.5rem] font-black text-white
                                tracking-tighter leading-[1.1] badge-font mt-2"
                  >
                    {item.role}
                  </h3>

                  <p
                    className="text-white/50 leading-relaxed text-[16px] flex-1 mt-1 pr-4"
                  >
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-4 pb-2 relative z-20">
                    {stack.map((skill) => {
                      const Icon = SKILL_ICONS[skill] || Database;
                      return (
                      <MagneticElement key={skill} radius={60} strength={0.25}>
                        <span
                          className="skill-badge inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full
                                     bg-[#0b0e14] border border-white/10
                                     text-white/60 text-[11px] lg:text-[13px] font-medium uppercase
                                     select-none cursor-pointer transition-colors"
                          onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, { backgroundColor: "rgba(255,255,255,0.1)", color: "#ffffff", scale: 1.05, duration: 0.3, ease: "power2.out" });
                            const icon = e.currentTarget.querySelector("svg");
                            if (icon) gsap.fromTo(icon, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
                          }}
                          onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, { backgroundColor: "#0b0e14", color: "rgba(255,255,255,0.6)", scale: 1, duration: 0.3, ease: "power2.out" });
                          }}
                        >
                          <Icon size={14} className="opacity-80 transition-transform" />
                          {skill}
                        </span>
                      </MagneticElement>
                    )})}
                  </div>

                  <div
                    className="pt-6 border-t border-white/[0.08] flex items-center
                               justify-between text-white/30 text-[9px] md:text-[10px] font-semibold
                               uppercase tracking-[0.2em]"
                  >
                    <span className="text-white/50">{item.date}</span>
                    <span className="flex items-center gap-3 text-white/50">
                      {t.experience.active}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop Viewport Vignette ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 hidden lg:block"
        style={{
          background: `linear-gradient(to right,
            rgba(11,14,20,0.95) 0%,
            translate 10%,
            transparent 90%,
            rgba(11,14,20,0.95) 100%)`,
        }}
      />
    </section>
  );
};
