import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Language, translations } from "../../constants/translations";
import { scrambleText } from "../../utils/textEffects";

// Components
import { Hero } from "./Hero";
import { Experience } from "./Experience";
import { Skills } from "./Skills";
import { Projects } from "./Projects";
import { Contact } from "./Contact";

gsap.registerPlugin(ScrollTrigger);

export default function Sections({
  language,
  loaded,
  heroReady,
}: {
  language: Language;
  loaded: boolean;
  heroReady: boolean;
}) {
  const t = translations[language].sections;
  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hudBarRef = useRef<HTMLDivElement>(null);
  const hudEdgeRef = useRef<HTMLDivElement>(null);
  // ── Ref-based active section guard — prevents re-renders on every scroll tick
  const activeSectionRef = useRef(1);
  const [activeSection, setActiveSection] = useState(1);
  const [time, setTime] = useState<Date | null>(null);

  // Guard: only call setState when section index genuinely changes
  const setActiveSectionSafe = useCallback((idx: number) => {
    if (activeSectionRef.current !== idx) {
      activeSectionRef.current = idx;
      setActiveSection(idx);
    }
  }, []);

  // ── Clock ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time
    ? time.toLocaleTimeString(language === "en" ? "en-US" : "es-ES", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Loading...";

  // ── activeSection update guard ──
  const updateHudVisuals = useCallback((idx: number) => {
    setActiveSectionSafe(idx);
    
    // Snap the liquid progress bar to the exact button coordinates
    if (!hudRef.current || !hudBarRef.current || !hudEdgeRef.current) return;
    const buttons = Array.from(hudRef.current.querySelectorAll("button"));
    const btn = buttons[idx - 1]; // 1-indexed
    if (!btn) return;

    // Calculate left/width percentages relative to the whole HUD
    const containerWidth = hudRef.current.offsetWidth;
    // Map visual progress to the right edge of the current button
    const targetWidth = btn.offsetLeft + btn.offsetWidth;
    const pct = (targetWidth / containerWidth) * 100;

    // Smoothly animate the liquid bar to strictly match the selected section
    gsap.to(hudBarRef.current, {
      width: `${pct}%`,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto"
    });
    gsap.to(hudEdgeRef.current, {
      left: `${pct}%`,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto"
    });
  }, [setActiveSectionSafe]);

  // ── Active section tracking via callbacks ──────────────────────────────────
  const handleSectionEnter = useCallback((idx: number) => setActiveSectionSafe(idx), [setActiveSectionSafe]);

  // ── Section orchestration (avoids touching pinned sections) ────────────────
  useEffect(() => {
    if (!containerRef.current || !loaded) return;

    // Small delay to let pinned sections settle before measuring
    const initTimer = setTimeout(() => {
      const ctx = gsap.context(() => {
        gsap.defaults({ overwrite: "auto" });

        // ── Letterbox section transitions ────────────────────────────────────
        // Applied only to non-Experience sections (section-1, 3, 4, 5)
        // Experience handles its own pinning internally.
        const transitionSections = Array.from(
          containerRef.current?.querySelectorAll("section:not(#section-2)") ?? []
        );

        transitionSections.forEach((section) => {
          const el = section as HTMLElement;

          // Outgoing: scale down + fade as it leaves upward
          gsap.to(el, {
            scale: 0.96,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "center top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        });

        // ── Reveal animations for non-pinned sections ────────────────────────
        const revealSections = Array.from(
          containerRef.current?.querySelectorAll(
            "section:not(#section-1):not(#section-2)"
          ) ?? []
        );

        revealSections.forEach((section) => {
          const revealTexts = section.querySelectorAll(".reveal-text");
          const content = section.querySelector(".reveal-content");
          const items = section.querySelectorAll(".stagger-item");

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
              fastScrollEnd: true,
            },
          });

          if (revealTexts.length > 0) {
            tl.fromTo(
              revealTexts,
              { y: "105%", rotate: 2 },
              { y: "0%", rotate: 0, duration: 0.54, stagger: 0.085, ease: "expo.out" }
            );

            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              tl.call(() => {
                revealTexts.forEach((node, i) => {
                  const el = node as HTMLElement;
                  gsap.delayedCall(i * 0.06, () => scrambleText(el, 0.58));
                });
              }, [], 0.08);
            }
          }

          if (content) {
            tl.fromTo(
              content,
              { y: 54, opacity: 0, rotateX: -8 },
              { y: 0, opacity: 1, rotateX: 0, duration: 0.44 },
              "-=0.24"
            );
          }

          if (items.length > 0) {
            tl.fromTo(
              items,
              { y: 28, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, stagger: 0.045 },
              "-=0.26"
            );

            const ghostBorders = section.querySelectorAll(".ghost-border");
            if (ghostBorders.length > 0) {
              tl.fromTo(
                ghostBorders,
                { strokeDashoffset: 1000, opacity: 0 },
                { strokeDashoffset: 0, opacity: 0.5, duration: 0.82, ease: "power2.out" },
                "-=0.34"
              );
            }
          }
        });

        // ── Global Section Tracking (Reliable Up/Down) ───────────────────────
        [1, 2, 3, 4, 5].forEach((num) => {
          ScrollTrigger.create({
            trigger: `#section-${num}`,
            start: "top 50%",       // Section becomes active when its top hits center
            end: "bottom 50%",      // Section ceases being active when its bottom hits center
            onEnter: () => updateHudVisuals(num),
            onEnterBack: () => updateHudVisuals(num),
          });
        });

        // ── CTA idle bounce (only while hero is visible) ─────────────────────
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          gsap.to(".hero-cta", {
            y: -5,
            duration: 0.75,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            scrollTrigger: {
              trigger: "#section-1",
              start: "top bottom",
              end: "bottom top",
              toggleActions: "play pause resume pause",
            },
          });
        }

        // ── Ensure triggers refresh after pinned section calculates its height
        ScrollTrigger.refresh();
      }, containerRef.current || undefined);

      return () => ctx.revert();
    }, 200); // Wait for Experience pin to register first

    return () => clearTimeout(initTimer);
  }, [loaded, handleSectionEnter, updateHudVisuals]);

  const navLabels = [
    language === "en" ? "HOME" : "INICIO",
    t.experience.tag,
    t.skills.tag,
    t.projects.tag,
    t.contact.tag,
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col relative z-10 w-full bg-transparent"
    >
      {/* ── HUD Navigation — single portal, progress-glow border ─────────── */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            ref={hudRef}
            className={`fixed left-1/2 -translate-x-1/2 bottom-8 z-[100] transition-all duration-1000 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            }`}
          >
            {/* Progress glow bar above the HUD */}
            <div className="relative">
              <div
                ref={hudRef}
                className="flex items-center gap-1 p-1.5 rounded-2xl bg-[#1c2028]/85 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
              >
                {/* Liquid progress fill — direct DOM ref, zero re-renders */}
                <div
                  ref={hudBarRef}
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[var(--primary)]/14 to-[var(--primary)]/4 pointer-events-none transition-none"
                  style={{ width: "0%" }}
                />
                {/* Glowing leading edge */}
                <div
                  ref={hudEdgeRef}
                  className="absolute top-1 bottom-1 w-[2px] rounded-full bg-[var(--primary)]/70 shadow-[0_0_8px_rgba(143,245,255,0.9)] pointer-events-none transition-none"
                  style={{ left: "0%" }}
                />

                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      const section = document.getElementById(`section-${num}`);
                      if (section) section.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`relative px-4 py-2 rounded-xl transition-all duration-400 ease-out text-[10px] font-bold tracking-widest badge-font uppercase hover:bg-white/5 z-10 ${
                      activeSection === num
                        ? "bg-[var(--primary)] text-[#0b0e14] shadow-[0_0_16px_rgba(143,245,255,0.3)]"
                        : "text-white/40"
                    }`}
                    aria-label={`Scroll to section ${num}`}
                  >
                    {navLabels[num - 1]}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      <Hero language={language} isStarted={heroReady} />
      <Experience language={language} onActive={() => handleSectionEnter(2)} />
      <Skills language={language} />
      <Projects language={language} />
      <Contact language={language} />

      {/* ── Live footer status bar ────────────────────────────────────────── */}
      <div className="h-[20vh] relative">
        <div className="fixed bottom-14 left-4 md:bottom-16 md:left-8 right-4 md:right-8 flex flex-row flex-wrap justify-between items-center gap-3 text-white/40 text-xs font-semibold tracking-widest uppercase z-[85] pointer-events-none">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
            </span>
            {t.contact.based}{" "}
            {Intl.DateTimeFormat(language === "en" ? "en-US" : "es-ES")
              .resolvedOptions()
              .timeZone.split("/")
              .pop()
              ?.replace("_", " ") || "Your City"}
          </span>
          <span>
            {formattedTime} {t.contact.time}
          </span>
        </div>
      </div>
    </div>
  );
}
