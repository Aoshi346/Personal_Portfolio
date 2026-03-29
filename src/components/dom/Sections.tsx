import { useEffect, useRef, useState } from "react";
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
  language:  Language;
  loaded:    boolean;
  heroReady: boolean;
}) {
  const t = translations[language].sections;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(1);
  const [time, setTime] = useState<Date | null>(null);

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

  useEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      gsap.defaults({ overwrite: "auto" });
      const sections = Array.from(
        containerRef.current?.querySelectorAll("section") ?? [],
      );

      sections.forEach((section, index) => {
        const content = section.querySelector(".reveal-content");
        const items = section.querySelectorAll(".stagger-item");
        const revealTexts = section.querySelectorAll(".reveal-text");

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none none",
            once: true,
            fastScrollEnd: true,
            onEnter: () => setActiveSection(index + 1),
            onEnterBack: () => setActiveSection(index + 1),
          },
        });

        if (revealTexts.length > 0) {
          tl.fromTo(
            revealTexts,
            { y: "105%", rotate: 2 },
            {
              y: "0%",
              rotate: 0,
              duration: 0.54,
              stagger: 0.085,
              ease: "expo.out",
            },
          );

          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            tl.call(
              () => {
                revealTexts.forEach((node, i) => {
                  const el = node as HTMLElement;
                  gsap.delayedCall(i * 0.06, () => scrambleText(el, 0.58));
                });
              },
              [],
              0.08,
            );
          }
        }

        if (content) {
          tl.fromTo(
            content,
            { y: 54, opacity: 0, rotateX: -8 },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.44,
              ease: "power3.out",
            },
            "-=0.24",
          );
        }

        if (items.length > 0) {
          tl.fromTo(
            items,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.045,
              ease: "power3.out",
            },
            "-=0.26",
          );

          const ghostBorders = section.querySelectorAll(".ghost-border");
          if (ghostBorders.length > 0) {
            tl.fromTo(
              ghostBorders,
              { strokeDashoffset: 1000, opacity: 0 },
              {
                strokeDashoffset: 0,
                opacity: 0.5,
                duration: 0.82,
                ease: "power2.out",
              },
              "-=0.34",
            );
          }
        }
      });

      if (
        loaded &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
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
    }, containerRef);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [loaded]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col relative z-10 w-full bg-transparent"
    >
      {/* HUD Navigation - Floating Island at the bottom */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed left-1/2 -translate-x-1/2 bottom-8 flex items-center gap-1 p-1.5 rounded-2xl bg-[#1c2028]/80 border border-white/10 backdrop-blur-2xl z-[100] transition-all duration-1000 shadow-2xl ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            }`}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  const section = document.getElementById(`section-${num}`);
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4 py-2 rounded-xl transition-all duration-500 ease-out text-[10px] font-bold tracking-widest badge-font uppercase hover:bg-white/5 ${
                  activeSection === num
                    ? "bg-[var(--primary)] text-[#0b0e14]"
                    : "text-white/40"
                }`}
                aria-label={`Scroll to section ${num}`}
              >
                {num === 1
                  ? language === "en"
                    ? "HOME"
                    : "INICIO"
                  : num === 2
                    ? t.experience.tag
                    : num === 3
                      ? t.skills.tag
                      : num === 4
                        ? t.projects.tag
                        : t.contact.tag}
              </button>
            ))}
          </div>,
          document.body,
        )}

      <Hero language={language} isStarted={heroReady} />
      <Experience language={language} />
      <Skills language={language} />
      <Projects language={language} />
      <Contact language={language} />

      {/* Spacing & Live Footer */}
      <div className="h-[26vh] relative">
        <div className="fixed bottom-14 left-4 md:bottom-16 md:left-8 right-4 md:right-8 flex flex-row flex-wrap justify-between items-center gap-3 text-white/50 text-xs md:text-sm font-semibold tracking-widest uppercase z-[210] pointer-events-none">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
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

      {typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed left-1/2 -translate-x-1/2 bottom-8 flex items-center gap-1 p-1.5 rounded-2xl bg-[#1c2028]/80 border border-white/10 backdrop-blur-2xl z-[100] transition-all duration-1000 shadow-2xl ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  const section = document.getElementById(`section-${num}`);
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-4 py-2 rounded-xl transition-all duration-500 ease-out text-[10px] font-bold tracking-widest badge-font uppercase hover:bg-white/5 ${activeSection === num ? "bg-[var(--primary)] text-[#0b0e14]" : "text-white/40"}`}
                aria-label={`Scroll to section ${num}`}
              >
                {num === 1
                  ? language === "en"
                    ? "HOME"
                    : "INICIO"
                  : num === 2
                    ? t.experience.tag
                    : num === 3
                      ? t.skills.tag
                      : num === 4
                        ? t.projects.tag
                        : t.contact.tag}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
