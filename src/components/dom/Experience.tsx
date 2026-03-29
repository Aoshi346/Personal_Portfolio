import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase } from "lucide-react";
import { Language, translations } from "../../constants/translations";
import { scrambleText } from "../../utils/textEffects";

gsap.registerPlugin(ScrollTrigger);

// ─── Per-role tech stack (static — avoids bloating translations) ──────────────
const ROLE_STACK: string[][] = [
  ["Algorithms", "SQL", "C++", "Python", "Architecture"],
  ["Django", "React", "TypeScript", "Linux", "SQL"],
  ["React", "Next.js", "Django", "REST", "Tailwind"],
];

// ─── Magnetic Element ─────────────────────────────────────────────────────────
const MagneticElement = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    if (Math.hypot(dx, dy) < 44) {
      gsap.to(innerRef.current, {
        x: dx * 0.38, y: dy * 0.38, duration: 0.26, ease: "power2.out", overwrite: "auto",
      });
    } else {
      gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)", overwrite: "auto" });
    }
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)", overwrite: "auto" });
  }, []);

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} className={`inline-block ${className}`}>
      <div ref={innerRef} className="origin-center">{children}</div>
    </div>
  );
};

// ─── Experience Engineering Timeline ──────────────────────────────────────────
interface ExperienceProps {
  language: Language;
  onActive?: () => void;
}

export const Experience = ({ language, onActive }: ExperienceProps) => {
  const t = translations[language].sections;

  const sectionRef         = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef           = useRef<HTMLSpanElement>(null);
  const tagRef             = useRef<HTMLDivElement>(null);
  const cardsRef           = useRef<(HTMLDivElement | null)[]>([]);

  // ── onActive stabilization — only fires when index actually changes ─────────
  // This prevents the Sections parent from re-rendering on every scroll tick
  // which would cause the GSAP context to tear down and re-mount (the "refresh glitch").
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;
  const activeCalledRef = useRef(false);

  const fireOnActive = useCallback(() => {
    if (!activeCalledRef.current) {
      activeCalledRef.current = true;
      onActiveRef.current?.();
    }
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    let tlPrimary: gsap.core.Timeline | null = null;
    const mm = gsap.matchMedia();

    // ── FOUC guard — set all invisible before first paint ───────────────────
    gsap.set(titleRef.current, { yPercent: 110 });
    gsap.set(tagRef.current, { autoAlpha: 0, y: 20 });

    cardsRef.current.forEach((card) => {
      if (!card) return;
      const ghost  = card.querySelector(".ghost-border");
      const body   = card.querySelectorAll(".card-body > *");
      const badges = card.querySelectorAll(".skill-badge");
      const pulse  = card.querySelector(".active-pulse");

      gsap.set(ghost,  { strokeDashoffset: 100 });
      gsap.set(body,   { opacity: 0, y: 28 });
      gsap.set(badges, { opacity: 0, y: 16, scale: 0.82 });
      // Default de-focused state
      gsap.set(card, { opacity: 0.5, scale: 0.92 });

      // Pulse — simple GSAP repeat, minimal main-thread cost
      if (pulse) {
        gsap.to(pulse, { scale: 2.4, opacity: 0, duration: 1.8, repeat: -1, ease: "power2.out" });
      }
    });

    // ── Desktop: Horizontal Pinned Scroll ────────────────────────────────────
    mm.add("(min-width: 1024px)", () => {
      const container = scrollContainerRef.current!;
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

      const getScrollAmount = () => -(container.scrollWidth - window.innerWidth);
      // 1.5× buffer gives Ghost Border and scramble animations full time to complete
      const getEndOffset = () => `+=${container.scrollWidth * 1.5}`;

      tlPrimary = gsap.timeline({
        scrollTrigger: {
          trigger:             sectionRef.current,
          start:               "top top",
          end:                 getEndOffset,
          pin:                 true,
          pinSpacing:          true,
          scrub:               1.5,          // Viscous, high-end feel
          invalidateOnRefresh: true,          // Recalculates cleanly on resize — no layout break
          anticipatePin:       1,
          onEnter:             fireOnActive,
          onEnterBack:         fireOnActive,
        },
      });

      tlPrimary.to(container, { x: getScrollAmount, ease: "none" });

      // ── Title scramble — only fires once on section entry ─────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 65%",
        once: true,
        onEnter: () => {
          gsap.to(tagRef.current, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" });
          gsap.to(titleRef.current, {
            yPercent: 0, duration: 0.85, ease: "power4.out",
            onComplete: () => { if (titleRef.current) scrambleText(titleRef.current); },
          });
        },
      });

      // ── Velocity skew + aero-drag compression ─────────────────────────────
      const proxy       = { skew: 0, scaleX: 1 };
      const skewSetter  = gsap.quickSetter(cards, "skewX",  "deg");
      const scaleXSetter = gsap.quickSetter(cards, "scaleX");
      const clamp       = gsap.utils.clamp(-9, 9);
      const clampSX     = gsap.utils.clamp(0.97, 1);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start:   "top top",
        end:     getEndOffset,
        onUpdate: (self) => {
          const raw = self.getVelocity() / -200;
          const skewVal  = clamp(raw);
          const scaleVal = clampSX(1 - Math.abs(raw) * 0.004); // max ~2% squish

          if (Math.abs(skewVal) > 0.06) {
            gsap.to(proxy, {
              skew:  skewVal,  scaleX: scaleVal,
              overwrite: true,  duration: 0.08,
              onUpdate: () => { skewSetter(proxy.skew); scaleXSetter(proxy.scaleX); },
            });
            gsap.to(proxy, {
              skew: 0, scaleX: 1,
              delay: 0.08, duration: 0.95, ease: "power3.out",
              onUpdate: () => { skewSetter(proxy.skew); scaleXSetter(proxy.scaleX); },
            });
          }
        },
      });

      // ── Per-card: Ghost draw, content stagger, skill cascade, focus inflate ─
      cards.forEach((card) => {
        const ghost  = card.querySelector(".ghost-border");
        const body   = card.querySelectorAll(".card-body > *");
        const badges = card.querySelectorAll(".skill-badge");

        ScrollTrigger.create({
          trigger:            card,
          containerAnimation: tlPrimary!,
          start:              "left 78%",
          end:                "right 22%",
          onEnter: () => {
            // Ghost border self-assembles clockwise
            gsap.to(ghost, { strokeDashoffset: 0, duration: 1.5, ease: "power3.inOut" });
            // Body content staggers in
            gsap.to(body, { opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: "power3.out", delay: 0.1 });
            // Skill badges cascade up — "system boot" feel
            gsap.to(badges, {
              opacity: 1, y: 0, scale: 1,
              duration: 0.5, stagger: 0.055, ease: "back.out(1.6)", delay: 0.55,
            });
            // Center inflate with cyan glow
            gsap.to(card, {
              opacity: 1, scale: 1.0,
              filter: "drop-shadow(0 0 32px rgba(143,245,255,0.14)) drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
              duration: 0.55, ease: "power3.out",
            });
          },
          onLeave: () => {
            gsap.to(card, {
              opacity: 0.42, scale: 0.9, filter: "none",
              duration: 0.4, ease: "power2.in",
            });
          },
          onEnterBack: () => {
            gsap.to(card, {
              opacity: 1, scale: 1.0,
              filter: "drop-shadow(0 0 32px rgba(143,245,255,0.14)) drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
              duration: 0.5, ease: "power3.out",
            });
          },
          onLeaveBack: () => {
            gsap.to(card, {
              opacity: 0.42, scale: 0.9, filter: "none",
              duration: 0.4, ease: "power2.in",
            });
          },
        });
      });

      // Single resize listener — only refreshes ScrollTrigger, never re-mounts context
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        window.removeEventListener("resize", onResize);
      };
    });

    // ── Mobile: Vertical snap stack ──────────────────────────────────────────
    mm.add("(max-width: 1023px)", () => {
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

      // Reset desktop de-focus state so mobile cards display at full opacity
      gsap.set(cards, { opacity: 1, scale: 1, filter: "none" });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.to(tagRef.current, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" });
          gsap.to(titleRef.current, {
            yPercent: 0, duration: 0.85, ease: "power4.out",
            onComplete: () => { if (titleRef.current) scrambleText(titleRef.current); },
          });
        },
      });

      cards.forEach((card) => {
        const ghost  = card.querySelector(".ghost-border");
        const body   = card.querySelectorAll(".card-body > *");
        const badges = card.querySelectorAll(".skill-badge");

        ScrollTrigger.create({
          trigger: card,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(ghost,  { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut" });
            gsap.to(body,   { opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: "power3.out", delay: 0.1 });
            gsap.to(badges, {
              opacity: 1, y: 0, scale: 1,
              duration: 0.45, stagger: 0.055, ease: "back.out(1.6)", delay: 0.45,
            });
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
      className="relative w-full min-h-screen lg:h-screen bg-[#0b0e14] lg:overflow-hidden flex flex-col lg:flex-row lg:items-center"
      style={{ willChange: "transform" }}
    >
      {/* ── Lateral vignette — focuses eye on center card ─────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background: `linear-gradient(to right,
            rgba(11,14,20,0.92) 0%,
            transparent 20%,
            transparent 80%,
            rgba(11,14,20,0.92) 100%)`,
        }}
      />

      {/* ── Top-left title block ──────────────────────────────────────────── */}
      <div className="relative lg:absolute lg:top-20 lg:left-20 z-20 px-8 pt-20 pb-6 lg:px-0 lg:pt-0 pointer-events-none">
        <MagneticElement>
          <div
            ref={tagRef}
            className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                       bg-[var(--secondary)]/10 border border-[var(--secondary)]/20
                       text-[var(--secondary)] text-[10px] font-bold tracking-[0.2em]
                       uppercase badge-font backdrop-blur-md pointer-events-auto"
          >
            <Briefcase size={13} /> {t.experience.tag}
          </div>
        </MagneticElement>

        <h2
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter badge-font"
        >
          <div className="overflow-hidden pb-3">
            <span
              ref={titleRef}
              className="block uppercase italic"
              data-final-text={t.experience.title}
            >
              {t.experience.title}
            </span>
          </div>
        </h2>
      </div>

      {/* ── Horizontal scroll track ───────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex flex-col lg:flex-row flex-nowrap
                   gap-10 lg:gap-14
                   px-8 lg:pl-[38vw] lg:pr-[24vw]
                   pb-24 lg:pb-0
                   w-full lg:w-max
                   lg:h-[74vh] lg:items-center
                   relative z-10"
        style={{ willChange: "transform" }}
      >
        {t.experience.roles.map((item, i) => {
          const stack = ROLE_STACK[i] ?? [];
          return (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="flex-none w-full transform-gpu cursor-default"
              style={{
                width: "clamp(340px, 44vw, 560px)",
                height: "clamp(480px, 70vh, 800px)",
                transformOrigin: "center center",
                willChange: "transform, opacity, filter",
              }}
            >
              {/* ── Engineering Module shell ────────────────────────────── */}
              <div
                className="relative w-full h-full flex flex-col rounded-[28px] overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  backdropFilter: "blur(24px)",
                }}
              >
                {/* ── Technical grid background layer ────────────────── */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(143,245,255,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(143,245,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: "36px 36px",
                    backgroundPosition: "center center",
                    // Subtle "slower than card" parallax via group-hover — CSS only
                    transition: "background-position 0.8s ease",
                  }}
                />

                {/* Corner accent markers — HUD aesthetic */}
                <div aria-hidden="true" className="absolute top-4 left-4 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M0 18 L0 0 L18 0" stroke="rgba(143,245,255,0.25)" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div aria-hidden="true" className="absolute bottom-4 right-4 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M18 0 L18 18 L0 18" stroke="rgba(143,245,255,0.25)" strokeWidth="1.2"/>
                  </svg>
                </div>

                {/* Ghost border — pathLength normalises perimeter to 100 */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="1" y="1"
                    width="calc(100% - 2px)"
                    height="calc(100% - 2px)"
                    rx="27" ry="27"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    pathLength="100"
                    className="ghost-border"
                    style={{
                      strokeDasharray: "100",
                      strokeDashoffset: "100",
                      opacity: 0.45,
                    }}
                  />
                </svg>

                {/* ── Card body ────────────────────────────────────────── */}
                <div
                  className="card-body relative z-10 flex flex-col h-full p-8 lg:p-10 gap-5"
                >
                  {/* Company badge */}
                  <MagneticElement className="self-start">
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                                 bg-[var(--primary)]/12 text-[var(--primary)]
                                 border border-[var(--primary)]/25
                                 text-[10px] tracking-[0.15em] font-bold uppercase badge-font
                                 shadow-[0_0_18px_rgba(143,245,255,0.08)]
                                 select-none cursor-default"
                    >
                      {item.company}
                    </div>
                  </MagneticElement>

                  {/* Role */}
                  <h3
                    className="text-2xl md:text-3xl lg:text-[1.85rem] font-black text-white
                               tracking-tight leading-[1.05]"
                  >
                    {item.role}
                  </h3>

                  {/* Description — monospace for "Systems" persona */}
                  <p
                    className="text-white/40 leading-[1.75] text-[13px] lg:text-[13.5px] flex-1"
                    style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
                  >
                    {item.desc}
                  </p>

                  {/* ── Tech-stack skill badges ───────────────────────── */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {stack.map((skill) => (
                      <span
                        key={skill}
                        className="skill-badge inline-flex items-center px-2.5 py-1 rounded-full
                                   bg-[var(--primary)]/8 border border-[var(--primary)]/18
                                   text-[var(--primary)]/80 text-[9px] font-bold uppercase
                                   tracking-[0.14em] badge-font
                                   shadow-[0_0_8px_rgba(143,245,255,0.04)]
                                   select-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Divider + footer */}
                  <div
                    className="pt-5 border-t border-white/[0.05] flex items-center
                               justify-between text-white/22 text-[9px] font-semibold
                               uppercase tracking-widest"
                  >
                    <span>{item.date}</span>
                    <span className="flex items-center gap-2.5">
                      <span className="relative flex h-2 w-2">
                        <span className="active-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--primary)]" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
                      </span>
                      {t.experience.active}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scroll hint (desktop) ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex absolute bottom-9 left-1/2 -translate-x-1/2 z-20
                   items-center gap-3 text-white/18 text-[9px] tracking-[0.26em]
                   uppercase badge-font pointer-events-none select-none"
      >
        <div className="w-7 h-px bg-white/15" />
        Scroll to explore
        <div className="w-7 h-px bg-white/15" />
      </div>
    </section>
  );
};
