import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase } from "lucide-react";
import { Language, translations } from "../../constants/translations";
import { scrambleText } from "../../utils/textEffects";

gsap.registerPlugin(ScrollTrigger);

// ─── Magnetic Element (applied to Briefcase tag and company badges) ──────────
const MagneticElement = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    
    // 40px radius magnetic field boundary
    if (Math.hypot(dx, dy) < 40) {
      gsap.to(innerRef.current, {
        x: dx * 0.4,
        y: dy * 0.4,
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)", overwrite: "auto" });
    }
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)", overwrite: "auto",
    });
  }, []);

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} className={`inline-block ${className}`}>
      <div ref={innerRef} className="origin-center">
        {children}
      </div>
    </div>
  );
};

// ─── Experience Engineering Timeline ──────────────────────────────────────────
export const Experience = ({ language }: { language: Language }) => {
  const t = translations[language].sections;

  // ── Refs ──────────────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  
  // Track cards to apply skew and localized ScrollTriggers
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    let tlPrimary: gsap.core.Timeline | null = null;
    const mm = gsap.matchMedia();

    // ── Reset Phase (FOUC & State Prep) ─────────────────────────────────────
    gsap.set(titleRef.current, { yPercent: 110 });
    gsap.set(tagRef.current, { autoAlpha: 0, y: 20 });
    
    cardsRef.current.forEach((card) => {
      if (!card) return;
      const ghost = card.querySelector(".ghost-border");
      const content = card.querySelectorAll(".card-content > *");
      const activePulse = card.querySelector(".active-pulse");
      
      gsap.set(ghost, { strokeDashoffset: 100 }); // pathLength is 100
      gsap.set(content, { opacity: 0, y: 20 });
      
      if (activePulse) {
        gsap.to(activePulse, {
          scale: 1.9, opacity: 0, duration: 1.5, repeat: -1, ease: "none"
        });
      }
    });

    // ── Desktop Horizontal Scroll ───────────────────────────────────────────
    mm.add("(min-width: 1024px)", () => {
      const container = scrollContainerRef.current!;
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

      // Calculates dynamic width for horizontal scroll
      const getScrollAmount = () => -(container.scrollWidth - window.innerWidth);

      tlPrimary = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${container.scrollWidth}`, // Scroll dist matches horizontal bounds
          pin: true,
          scrub: 1, // "Weighted" interpolation
          invalidateOnRefresh: true,
        },
      });

      tlPrimary.to(container, {
        x: getScrollAmount,
        ease: "none",
      });

      // ── Scramble Title Reveal ─────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        onEnter: () => {
          gsap.to(tagRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
          gsap.to(titleRef.current, { 
            yPercent: 0, 
            duration: 0.8, 
            ease: "power4.out",
            onComplete: () => {
              if (titleRef.current) scrambleText(titleRef.current);
            }
          });
        }
      });

      // ── Velocity Skew Mechanics ───────────────────────────────────────────
      const proxy = { skew: 0 };
      const skewSetter = gsap.quickSetter(cards, "skewX", "deg");
      const clamp = gsap.utils.clamp(-12, 12);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${container.scrollWidth}`,
        onUpdate: (self) => {
          // Negative implies leaning opposite scroll
          const velocity = clamp(self.getVelocity() / -150); 
          if (Math.abs(velocity) > 0.1) {
            gsap.to(proxy, {
                skew: velocity, overwrite: true, duration: 0.1,
                onUpdate: () => skewSetter(proxy.skew)
            });
            gsap.to(proxy, {
                skew: 0, delay: 0.1, duration: 0.8, ease: "power3.out",
                onUpdate: () => skewSetter(proxy.skew)
            });
          }
        },
      });

      // ── Localized Card Entrances via containerAnimation ───────────────────
      cards.forEach((card) => {
        const ghost = card.querySelector(".ghost-border");
        const content = card.querySelectorAll(".card-content > *");
        
        ScrollTrigger.create({
          trigger: card,
          containerAnimation: tlPrimary!,
          start: "left 75%", // Card enters the focus area
          onEnter: () => {
            gsap.to(ghost, { strokeDashoffset: 0, duration: 1.2, ease: "power3.inOut" });
            gsap.to(content, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.15 });
          },
        });
      });

      return () => {
        // cleanup handled by mm
      };
    });

    // ── Mobile Vertical Fallback ────────────────────────────────────────────
    mm.add("(max-width: 1023px)", () => {
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);
      
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(tagRef.current, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
          gsap.to(titleRef.current, { 
            yPercent: 0, duration: 0.8, ease: "power4.out",
            onComplete: () => { if (titleRef.current) scrambleText(titleRef.current); }
          });
        }
      });

      cards.forEach((card) => {
        const ghost = card.querySelector(".ghost-border");
        const content = card.querySelectorAll(".card-content > *");
        ScrollTrigger.create({
          trigger: card,
          start: "top 85%",
          onEnter: () => {
            gsap.to(ghost, { strokeDashoffset: 0, duration: 1.2, ease: "power3.inOut" });
            gsap.to(content, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.15 });
          }
        });
      });
      
      return () => {};
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-2"
      // Mobile relies on default document flow scrolling. Desktop hijacks it into 100vh locked pinning.
      className="relative w-full min-h-screen lg:h-screen bg-[#0b0e14] lg:overflow-hidden flex flex-col lg:flex-row lg:items-center will-change-transform"
    >
      {/* ── Title Context overlay ────────────────────────────────────────── */}
      <div className="relative lg:absolute lg:top-24 lg:left-24 z-20 px-8 pt-24 pb-8 lg:px-0 lg:pt-0 pointer-events-none">
        <MagneticElement>
          <div ref={tagRef} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md pointer-events-auto">
            <Briefcase size={14} /> {t.experience.tag}
          </div>
        </MagneticElement>

        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter badge-font drop-shadow-2xl">
          <div className="overflow-hidden pb-4">
            <span ref={titleRef} className="block uppercase italic pointer-events-auto shadow-black" data-final-text={t.experience.title}>
              {t.experience.title}
            </span>
          </div>
        </h2>
      </div>

      {/* ── Scroll Track ─────────────────────────────────────────────────── */}
      <div 
         ref={scrollContainerRef} 
         className="flex flex-col lg:flex-row flex-nowrap gap-8 lg:gap-16 px-8 lg:pl-[35vw] lg:pr-[20vw] pb-24 lg:pb-0 w-full lg:w-max lg:h-[65vh] lg:items-center relative z-10"
         style={{ willChange: "transform" }}
       >
        {t.experience.roles.map((item, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="flex-none w-full lg:w-[450px] xl:w-[500px] h-auto lg:h-[500px] group p-8 lg:p-10 rounded-[32px] bg-[#11141b] border border-white/[0.04] backdrop-blur-2xl transition-all duration-500 shadow-2xl flex flex-col relative overflow-hidden transform-gpu"
            style={{ transformOrigin: "bottom center" }}
          >
            {/* Ambient hover bloom */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Ghost Border SVG logic. pathLength 100 normalizes perimeter */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <rect
                x="1" y="1"
                width="calc(100% - 2px)" height="calc(100% - 2px)"
                rx="31" ry="31"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                pathLength="100"
                className="ghost-border opacity-50 shadow-[0_0_15px_rgba(143,245,255,0.2)]"
                style={{ strokeDasharray: "100", strokeDashoffset: "100" }}
              />
            </svg>

            {/* Staggered text body */}
            <div className="card-content mb-auto relative z-10 flex flex-col h-full pointer-events-auto">
              
              <MagneticElement className="self-start mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] tracking-[0.15em] font-bold uppercase badge-font shadow-[0_0_15px_rgba(143,245,255,0.05)] cursor-default">
                  {item.company}
                </div>
              </MagneticElement>

              <h3 className="text-2xl md:text-3xl font-black text-white mb-5 tracking-tight leading-[1.1]">
                {item.role}
              </h3>
              
              <p className="text-white/50 font-light leading-relaxed text-sm md:text-base max-w-[90%] pb-6 lg:pb-0">
                {item.desc}
              </p>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-white/30 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest">
                <span>{item.date}</span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="active-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] pointer-events-none"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                  </span>
                  {t.experience.active}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
