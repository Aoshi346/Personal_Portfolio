import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase } from "lucide-react";
import { Language, translations } from "../../constants/translations";
import { scrambleText } from "../../utils/textEffects";

gsap.registerPlugin(ScrollTrigger);

const ROLE_STACK: string[][] = [
  ["Algorithms", "SQL", "C++", "Python", "Architecture"],
  ["Django", "React", "TypeScript", "Linux", "SQL"],
  ["React", "Next.js", "Django", "REST", "Tailwind"],
];

const MagneticElement = ({
  children,
  className = "",
  onHoverAction,
}: {
  children: React.ReactNode;
  className?: string;
  onHoverAction?: () => void;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);

    if (Math.hypot(dx, dy) < 44) {
      gsap.to(innerRef.current, {
        x: dx * 0.38,
        y: dy * 0.38,
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
  }, []);

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
  onActiveRef.current = onActive;
  const activeCalledRef = useRef(false);

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
      const ghost = card.querySelector(".ghost-border");
      const activeBorder = card.querySelector(".active-outer-border");
      const body = card.querySelectorAll(".card-body > *");
      const badges = card.querySelectorAll(".skill-badge");
      const pulse = card.querySelector(".active-pulse");

      gsap.set(ghost, { strokeDashoffset: 100 });
      gsap.set(activeBorder, { opacity: 0 });
      gsap.set(body, { opacity: 0, y: 30 });
      gsap.set(badges, { autoAlpha: 0, scale: 0.2, y: 15 });
      gsap.set(card, { opacity: 0.35, scale: 0.88, filter: "blur(4px)" });

      if (pulse) {
        gsap.to(pulse, { scale: 2.5, opacity: 0, duration: 1.6, repeat: -1, ease: "power2.out" });
      }
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

      // ── Phase 2: The Recess (Title Watermark) ──────────────────────────────
      // Title expands and fades to form a watermark over the first 15% of scrub
      tlPrimary.to(
        titleWrapRef.current,
        {
          opacity: 0.05,
          scale: 1.6, // Massive screen-filling watermark
          xPercent: 5, // Slight drift right
          duration: 0.15, // 15% of timeline duration
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
      const clamp = gsap.utils.clamp(-8, 8);
      const clampSX = gsap.utils.clamp(0.96, 1);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: getEndOffset,
        onUpdate: (self) => {
          const raw = self.getVelocity() / -250;
          const skewVal = clamp(raw);
          const scaleVal = clampSX(1 - Math.abs(raw) * 0.005);

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

      // ── DOF & Hardware Initialization ──────────────────────────────────────
      cards.forEach((card) => {
        const ghost = card.querySelector(".ghost-border");
        const activeBorder = card.querySelector(".active-outer-border");
        const body = card.querySelectorAll(".card-body > *");
        const badges = card.querySelectorAll(".skill-badge");

        ScrollTrigger.create({
          trigger: card,
          containerAnimation: tlPrimary!,
          start: "left 75%",
          end: "right 25%",
          onEnter: () => {
            gsap.to(ghost, { strokeDashoffset: 0, duration: 1.6, ease: "power3.inOut" });
            gsap.to(body, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", delay: 0.1 });
            gsap.to(activeBorder, { opacity: 0.4, duration: 1.2, ease: "power2.inOut", delay: 0.4 });
            gsap.to(badges, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.05,
              ease: "back.out(2.2)",
              delay: 0.45,
            });
            gsap.to(card, {
              opacity: 1,
              scale: 1.02,
              filter: "blur(0px) drop-shadow(0 0 45px rgba(143,245,255,0.12)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))",
              duration: 0.6,
              ease: "power3.out",
            });
          },
          onLeave: () => {
            gsap.to(activeBorder, { opacity: 0, duration: 0.4 });
            gsap.to(card, { opacity: 0.35, scale: 0.88, filter: "blur(4px) drop-shadow(none)", duration: 0.5, ease: "power2.in" });
          },
          onEnterBack: () => {
            gsap.to(activeBorder, { opacity: 0.4, duration: 0.4 });
            gsap.to(card, { opacity: 1, scale: 1.02, filter: "blur(0px) drop-shadow(0 0 45px rgba(143,245,255,0.12)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))", duration: 0.6, ease: "power3.out" });
          },
          onLeaveBack: () => {
             gsap.to(activeBorder, { opacity: 0, duration: 0.4 });
             gsap.to(card, { opacity: 0.35, scale: 0.88, filter: "blur(4px) drop-shadow(none)", duration: 0.5, ease: "power2.in" });
          },
        });
      });

      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize, { passive: true });
      return () => window.removeEventListener("resize", onResize);
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

      // Mobile Sticky Title Blur-Fade (Progressive)
      // As the first card climbs towards the sticky title, the title fades into the background.
      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: "top 180px", // Trigger when first card is 180px from top
        end: "top 40px",    // Finish when card is 40px from top
        scrub: true,
        animation: gsap.fromTo(titleWrapRef.current, 
          { opacity: 1, filter: "blur(0px)", scale: 1 }, 
          { opacity: 0.2, filter: "blur(8px)", scale: 0.95, ease: "none" }
        )
      });

      cards.forEach((card) => {
        const ghost = card.querySelector(".ghost-border");
        const activeBorder = card.querySelector(".active-outer-border");
        const body = card.querySelectorAll(".card-body > *");
        const badges = card.querySelectorAll(".skill-badge");

        ScrollTrigger.create({
          trigger: card,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(ghost, { strokeDashoffset: 0, duration: 1.5, ease: "power3.inOut" });
            gsap.to(activeBorder, { opacity: 0.3, duration: 1.0 });
            gsap.to(body, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.1 });
            gsap.to(badges, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(2.2)", delay: 0.45 });
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
                   px-8 lg:pl-[50vw] lg:pr-[25vw]
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
              className="flex-none w-full transform-gpu cursor-default relative group"
              style={{
                width: "clamp(340px, 46vw, 600px)",
                height: "clamp(480px, 74vh, 840px)",
                transformOrigin: "center center",
                willChange: "transform, opacity, filter",
              }}
            >
              <div
                className="active-outer-border absolute inset-[-1.5px] rounded-[30px] z-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom right, var(--primary), rgba(143,245,255,0.05) 40%, transparent)",
                  opacity: 0,
                }}
              />
              
              <div
                className="relative w-full h-full flex flex-col rounded-[28px] overflow-hidden bg-[#0b0e14]"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.012) 100%)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                  backdropFilter: "blur(30px)",
                }}
              >
                <div
                  className="absolute inset-x-0 h-[40%] bg-gradient-to-b from-transparent via-[var(--primary)]/10 to-transparent pointer-events-none animate-scanline mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(143,245,255,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(143,245,255,0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: "36px 36px",
                    backgroundPosition: "center center",
                    transition: "background-position 0.8s ease-out",
                  }}
                />

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="2" y="2"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    rx="26" ry="26"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    pathLength="100"
                    className="ghost-border"
                    style={{ strokeDasharray: "100", strokeDashoffset: "100", opacity: 0.35 }}
                  />
                </svg>

                <div className="absolute top-6 right-6 flex flex-col items-end gap-[2px] pointer-events-none badge-font opacity-40 mix-blend-plus-lighter">
                  <span className="text-[9px] text-[var(--primary)] tracking-[0.2em]">SYS-MODULE: 0x0{i + 1}</span>
                  <span className="text-[7.5px] text-white/60 tracking-[0.1em]" style={{ fontFamily: "monospace" }}>T-INDEX {Math.random().toString(36).substring(2,8).toUpperCase()}</span>
                </div>

                <div aria-hidden="true" className="absolute top-5 left-5 pointer-events-none">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M0 22 L0 0 L22 0" stroke="rgba(143,245,255,0.2)" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div aria-hidden="true" className="absolute bottom-5 right-5 pointer-events-none">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M22 0 L22 22 L0 22" stroke="rgba(143,245,255,0.2)" strokeWidth="1.5"/>
                  </svg>
                </div>

                <div className="card-body relative z-[15] flex flex-col h-full p-8 lg:p-12 gap-6">
                  <div className="self-start mt-2">
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                 bg-[var(--primary)]/10 text-[var(--primary)]
                                 border border-[var(--primary)]/30
                                 text-[10px] lg:text-[11px] tracking-[0.2em] font-bold uppercase badge-font
                                 shadow-[0_0_20px_rgba(143,245,255,0.08)]
                                 select-none cursor-default"
                    >
                      {item.company}
                    </div>
                  </div>

                  <h3
                    className="text-3xl md:text-4xl lg:text-[2.2rem] font-black text-white
                               tracking-tight leading-[1.1] mt-2 drop-shadow-md"
                  >
                    {item.role}
                  </h3>

                  <p
                    className="text-white/45 leading-[1.8] text-[13.5px] lg:text-[14.5px] flex-1 mt-1 pr-4"
                    style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
                  >
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-4 pb-2">
                    {stack.map((skill) => (
                      <span
                        key={skill}
                        className="skill-badge inline-flex items-center px-3.5 py-1.5 rounded-full
                                   bg-[#0b0e14] border-[1.2px] border-[var(--primary)]
                                   text-[var(--primary)] text-[11px] font-bold uppercase
                                   tracking-[0.2em] badge-font
                                   shadow-[0_4px_12px_rgba(0,0,0,0.6),_inset_0_0_8px_rgba(143,245,255,0.1)]
                                   select-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div
                    className="pt-6 border-t border-white/[0.08] flex items-center
                               justify-between text-white/30 text-[9px] md:text-[10px] font-semibold
                               uppercase tracking-[0.2em]"
                  >
                    <span>{item.date}</span>
                    <span className="flex items-center gap-3">
                      <span className="relative flex h-[10px] w-[10px]">
                        <span className="active-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                        <span className="relative inline-flex rounded-full h-[10px] w-[10px] bg-[var(--primary)]" />
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
