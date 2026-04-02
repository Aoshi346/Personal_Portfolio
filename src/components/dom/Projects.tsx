import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Layout, ExternalLink, Code2, Sparkles, Zap, ChevronRight } from "lucide-react";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiGreensock,
  SiDjango,
  SiReact,
  SiPostgresql,
} from "react-icons/si";
import { Language, translations } from "../../constants/translations";
import { MagneticButton } from "./MagneticButton";

// ── Geometric SVG mesh placeholder for project media viewports ──────────────
const GeometricMesh = ({ seed }: { seed: number }) => {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    x1: (i * 60 + seed * 30) % 400,
    y1: 0,
    x2: ((i * 40 + seed * 50) % 400),
    y2: 200,
    opacity: 0.06 + (i % 3) * 0.03,
  }));
  const circles = Array.from({ length: 5 }, (_, i) => ({
    cx: (i * 80 + seed * 60) % 380 + 10,
    cy: (i * 30 + seed * 25) % 160 + 20,
    r: 8 + (i % 3) * 6,
    opacity: 0.05 + (i % 2) * 0.04,
  }));

  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`mesh-grad-${seed}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#mesh-grad-${seed})`} />
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="var(--primary)"
          strokeWidth="0.5"
          opacity={l.opacity}
        />
      ))}
      {circles.map((c, i) => (
        <circle
          key={i}
          cx={c.cx} cy={c.cy} r={c.r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="0.5"
          opacity={c.opacity}
        />
      ))}
      {/* Grid dots */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle
          key={`dot-${i}`}
          cx={(i % 8) * 55 + 15}
          cy={Math.floor(i / 8) * 50 + 15}
          r="1"
          fill="var(--primary)"
          opacity="0.08"
        />
      ))}
    </svg>
  );
};

export const Projects = ({ language }: { language: Language }) => {
  const t = translations[language].sections;
  const heroT = translations[language].hero;

  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const meshRefs = useRef<(HTMLDivElement | null)[]>([]);
  const promoPulseRef = useRef<HTMLDivElement>(null);
  const promoCardRef = useRef<HTMLDivElement>(null);
  const borderRefs = useRef<(SVGRectElement | null)[]>([]);
  const borderLengthRef = useRef<number[]>([]);

  const projects = [
    {
      title: "TesisFar",
      desc: t.projects.tesisFar.desc,
      tags: [
        { name: "Next.js", icon: SiNextdotjs },
        { name: "Tailwind", icon: SiTailwindcss },
        { name: "GSAP", icon: SiGreensock },
        { name: "Django", icon: SiDjango },
      ],
      meshSeed: 1,
      href: "#",
    },
    {
      title: "EchoPlan",
      desc: t.projects.echoPlan.desc,
      tags: [
        { name: "React", icon: SiReact },
        { name: "Tailwind", icon: SiTailwindcss },
        { name: "Django", icon: SiDjango },
        { name: "MySQL", icon: SiPostgresql },
      ],
      meshSeed: 2,
      href: "#",
    },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ── Gradient Mesh Slow-Float Animation ────────────────────────────────
      meshRefs.current.forEach((mesh, i) => {
        if (!mesh) return;
        const svgEl = mesh.querySelector("svg");
        if (!svgEl) return;
        gsap.to(svgEl, {
          x: "random(-12, 12)",
          y: "random(-8, 8)",
          duration: "random(8, 14)",
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 1.2,
        });
      });

      // ── Ghost Border — measure path lengths on first render ───────────────
      borderRefs.current.forEach((rect, i) => {
        if (!rect) return;
        try {
          const len = (rect as unknown as SVGGeometryElement).getTotalLength?.() ?? 1200;
          borderLengthRef.current[i] = len;
          gsap.set(rect, { strokeDasharray: len, strokeDashoffset: len });
        } catch {
          borderLengthRef.current[i] = 1200;
          gsap.set(rect, { strokeDasharray: 1200, strokeDashoffset: 1200 });
        }
      });

      // ── Per-Card: 3D Tilt + Spotlight + Ghost Border hover logic ─────────
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const inner = card.querySelector<HTMLDivElement>(".proj-card-inner");
        const border = borderRefs.current[i];
        if (!inner) return;

        // quickTo setters for silky 3D tilt
        const setX = gsap.quickTo(inner, "rotationY", { duration: 0.55, ease: "power3.out" });
        const setY = gsap.quickTo(inner, "rotationX", { duration: 0.55, ease: "power3.out" });

        const onMove = (e: MouseEvent) => {
          if (!window.matchMedia("(hover: hover)").matches) return;
          const rect = inner.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Spotlight CSS custom props
          inner.style.setProperty("--mouse-x", `${x}px`);
          inner.style.setProperty("--mouse-y", `${y}px`);

          const cx = rect.width / 2;
          const cy = rect.height / 2;

          // Clamped ±4° rotations
          setX(gsap.utils.clamp(-4, 4, ((x - cx) / cx) * 4));
          setY(gsap.utils.clamp(-4, 4, ((y - cy) / cy) * -4));
        };

        const onEnter = () => {
          if (!window.matchMedia("(hover: hover)").matches) return;
          // Draw border
          if (border) {
            const len = borderLengthRef.current[i] ?? 1200;
            gsap.to(border, {
              strokeDashoffset: 0,
              duration: 0.65,
              ease: "power3.out",
            });
            gsap.to(border, { opacity: 0.75, duration: 0.3 });
          }
        };

        const onLeave = () => {
          if (!window.matchMedia("(hover: hover)").matches) return;
          setX(0);
          setY(0);
          inner.style.setProperty("--mouse-x", "-1000px");
          inner.style.setProperty("--mouse-y", "-1000px");
          // Erase border
          if (border) {
            const len = borderLengthRef.current[i] ?? 1200;
            gsap.to(border, {
              strokeDashoffset: len,
              duration: 0.5,
              ease: "power2.in",
            });
            gsap.to(border, { opacity: 0, duration: 0.3, delay: 0.2 });
          }
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
      });

      // ── Promo Card: orbiting background pulse ──────────────────────────────
      if (promoPulseRef.current) {
        gsap.set(promoPulseRef.current, { opacity: 0.3 });
        gsap.to(promoPulseRef.current, {
          x: 120,
          y: -60,
          duration: 8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        // Second orbit on a sub-element
        gsap.to(promoPulseRef.current, {
          scale: 1.2,
          duration: 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 2,
        });
      }

      // ── Promo Card: similar 3D Tilt + Spotlight ────────────────────────────
      if (promoCardRef.current) {
        const promoInner = promoCardRef.current.querySelector<HTMLDivElement>(".proj-card-inner");
        if (promoInner) {
          const setX = gsap.quickTo(promoInner, "rotationY", { duration: 0.6, ease: "power3.out" });
          const setY = gsap.quickTo(promoInner, "rotationX", { duration: 0.6, ease: "power3.out" });

          const onMove = (e: MouseEvent) => {
            if (!window.matchMedia("(hover: hover)").matches) return;
            const rect = promoInner.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            promoInner.style.setProperty("--mouse-x", `${x}px`);
            promoInner.style.setProperty("--mouse-y", `${y}px`);
            setX(gsap.utils.clamp(-4, 4, ((x - rect.width / 2) / (rect.width / 2)) * 3));
            setY(gsap.utils.clamp(-4, 4, ((y - rect.height / 2) / (rect.height / 2)) * -3));
          };
          const onLeave = () => {
            setX(0);
            setY(0);
            promoInner.style.setProperty("--mouse-x", "-1000px");
            promoInner.style.setProperty("--mouse-y", "-1000px");
          };

          promoCardRef.current.addEventListener("mousemove", onMove);
          promoCardRef.current.addEventListener("mouseleave", onLeave);
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-4"
      className="min-h-[100dvh] py-32 px-8 md:px-16 lg:px-24 relative overflow-hidden flex items-center bg-transparent"
    >
      <div className="reveal-content relative z-10 w-full max-w-6xl mx-auto">

        {/* ── Section Label ───────────────────────────────────────────────── */}
        <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
          <Layout size={14} /> {t.projects.tag}
        </div>
        <h2 className="stagger-item text-5xl md:text-7xl font-bold text-white mb-16 tracking-tighter badge-font uppercase italic">
          <div className="overflow-hidden">
            <span className="block reveal-text">{t.projects.title}</span>
          </div>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Project Cards ───────────────────────────────────────────── */}
          {projects.map((project, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="stagger-item group relative"
              style={{ perspective: "1200px" }}
            >
              {/* Ghost Border SVG — drawn on hover via GSAP */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  ref={(el) => { borderRefs.current[i] = el; }}
                  x="1" y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="24" ry="24"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  style={{ opacity: 0 }}
                />
              </svg>

              <div
                className="proj-card-inner relative w-full rounded-[24px] bg-[#0d1117] border border-white/10 overflow-hidden flex flex-col"
                style={{
                  willChange: "transform",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Spotlight overlay */}
                <div
                  className="pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[24px]"
                  style={{
                    background: "radial-gradient(circle 500px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255,255,255,0.06) 0%, transparent 60%)",
                  }}
                />

                {/* ── Media Viewport (top 50%) ───────────────────────── */}
                <div
                  ref={(el) => { meshRefs.current[i] = el; }}
                  className="relative w-full overflow-hidden bg-[#161b22] rounded-t-[24px]"
                  style={{ height: "220px" }}
                >
                  <GeometricMesh seed={project.meshSeed} />

                  {/* Subtle gradient vignette over mesh */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(to bottom, transparent 40%, #0d1117 100%)",
                    }}
                  />

                  {/* Media zone label */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20 badge-font">
                      Project Preview
                    </span>
                  </div>

                  {/* External link */}
                  <a
                    href={project.href}
                    aria-label={`View ${project.title}`}
                    className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/10"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={14} className="text-white/60" />
                  </a>
                </div>

                {/* ── Content Zone (bottom 50%) ──────────────────────── */}
                <div className="flex flex-col flex-1 p-7 gap-5 relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight badge-font">
                    {project.title}
                  </h3>
                  <p className="text-white/50 text-base leading-relaxed flex-1">
                    {project.desc}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex gap-2.5 flex-wrap pt-1">
                    {project.tags.map((tag) => {
                      const TagIcon = tag.icon;
                      return (
                        <span
                          key={tag.name}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.08] hover:bg-white/10 hover:text-white/80 hover:border-white/20 transition-all duration-200 cursor-pointer badge-font"
                        >
                          <TagIcon size={11} />
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ── Promo Card ──────────────────────────────────────────────────── */}
          <div
            ref={promoCardRef}
            className="stagger-item lg:col-span-2 group relative mt-4"
            style={{ perspective: "1200px" }}
          >
            <div
              className="proj-card-inner relative w-full rounded-[24px] bg-[#0d1117] border border-white/10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14 cursor-default"
              style={{
                willChange: "transform",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Spotlight */}
              <div
                className="pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[24px]"
                style={{
                  background: "radial-gradient(circle 600px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255,255,255,0.05) 0%, transparent 60%)",
                }}
              />

              {/* GSAP-orbiting background pulse */}
              <div
                ref={promoPulseRef}
                className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-[var(--primary)]/10 blur-[100px] pointer-events-none -z-10 rounded-full"
                style={{ opacity: 0.3 }}
              />

              {/* Decorative grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                  backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />

              {/* Text content */}
              <div className="text-left max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-4 mb-8">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]" />
                  </span>
                  <span className="text-white/60 text-sm font-semibold uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors badge-font">
                    {t.projects.personalized.status}
                  </span>
                </div>

                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight badge-font">
                  {t.projects.personalized.title}
                </h3>
                <p className="text-white/50 text-lg md:text-xl font-light leading-relaxed mb-10 group-hover:text-white/70 transition-colors duration-500">
                  {t.projects.personalized.desc}
                </p>

                <div className="flex flex-wrap gap-4">
                  {[
                    { label: t.projects.personalized.cta, Icon: Code2 },
                    { label: "Fluid Motion", Icon: Sparkles },
                    { label: "Premium Performance", Icon: Zap },
                  ].map(({ label, Icon }) => (
                    <span
                      key={label}
                      className="flex items-center gap-2 text-white/40 text-xs md:text-sm font-bold tracking-[0.1em] border border-white/10 px-4 py-2 rounded-full bg-white/[0.03] group-hover:bg-white/[0.07] group-hover:border-white/20 group-hover:text-white/80 transition-all duration-300 badge-font"
                    >
                      <Icon size={14} className="text-[var(--primary)]/50 group-hover:text-[var(--primary)] transition-colors" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── MagneticButton CTA ─────────────────────────────────── */}
              <div className="relative z-10 flex-shrink-0">
                <MagneticButton
                  href="#section-5"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("section-5")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="no-cursor-snap"
                >
                  <span className="whitespace-nowrap inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-br from-[var(--secondary)] to-[var(--tertiary)] text-black text-lg font-bold rounded-xl hover:brightness-110 transition-all shadow-xl shadow-[var(--secondary)]/10">
                    {heroT.letsTalk}
                    <ChevronRight size={20} />
                  </span>
                </MagneticButton>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
