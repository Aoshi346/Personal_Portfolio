import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { Layout, ExternalLink, Code2, Sparkles, Zap, ChevronRight, Eye, X, ChevronLeft, Github } from "lucide-react";
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

// ── Geometric SVG mesh — lives z-0 as fallback behind project image ──────────
const GeometricMesh = ({ seed }: { seed: number }) => {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    x1: (i * 60 + seed * 30) % 400,
    y1: 0,
    x2: (i * 40 + seed * 50) % 400,
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
      className="absolute inset-0 w-full h-full z-0"
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
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="var(--primary)" strokeWidth="0.5" opacity={l.opacity} />
      ))}
      {circles.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r}
          fill="none" stroke="var(--primary)" strokeWidth="0.5" opacity={c.opacity} />
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={`dot-${i}`}
          cx={(i % 8) * 55 + 15} cy={Math.floor(i / 8) * 50 + 15}
          r="1" fill="var(--primary)" opacity="0.08" />
      ))}
    </svg>
  );
};

// ── Types ────────────────────────────────────────────────────────────────
type Tag = { name: string; icon: React.ElementType };
type Project = {
  title: string;
  desc: string;
  longDesc: string;
  image: string;
  gallery: string[];
  tags: Tag[];
  meshSeed: number;
  href: string;
  github?: string;
};

// ── Case Study Modal component ────────────────────────────────────────────────
const CaseStudyModal = ({
  project, onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Scroll lock + Entry animation
  useEffect(() => {
    if (project && modalRef.current && backdropRef.current) {
      document.body.style.overflow = "hidden";
      setCurrentImageIndex(0);

      gsap.fromTo(backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power2.out" }
      );
      
      gsap.fromTo(modalRef.current,
        { y: 50, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" }
      );
    }
  }, [project]);

  const handleClose = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        y: 20, scale: 0.95, opacity: 0, duration: 0.3, ease: "power2.in"
      });
      gsap.to(backdropRef.current, {
        autoAlpha: 0, duration: 0.4, ease: "power2.in", onComplete: () => {
          document.body.style.overflow = "";
          onClose();
        }
      });
    }
  };

  if (!project) return null;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % project.gallery.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? project.gallery.length - 1 : prev - 1));

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-[#0b0e14]/80 backdrop-blur-md invisible"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-[90vw] max-w-6xl h-[85vh] bg-[#0d1117] rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Left Side: Gallery Carousel (60% on desktop, ~40vh on mobile) */}
        <div className="relative w-full lg:w-[60%] h-[40vh] lg:h-full bg-black shrink-0 group/gallery">
          {/* Faint mesh fallback */}
          <GeometricMesh seed={project.meshSeed} />
          
          <img
            // Keying by index so react remounts and GSAP could potentially animate, but for simplicity standard react rendering is fine (we rely on transition-opacity)
            key={project.gallery[currentImageIndex]}
            src={project.gallery[currentImageIndex]}
            alt={`Gallery ${currentImageIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover z-10 animate-in fade-in duration-500"
          />

          {/* Carousel Controls */}
          {project.gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover/gallery:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover/gallery:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {project.gallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex ? "bg-[var(--primary)] w-6 scale-100" : "bg-white/30 hover:bg-white/50 scale-90"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Vignette */}
          <div className="absolute inset-0 z-10 pointer-events-none"
               style={{ background: "linear-gradient(to right, rgba(13,17,23,0) 80%, #0d1117 100%)" }} />
        </div>

        {/* Right Side: The Brief (40% width on desktop) */}
        <div className="w-full lg:w-[40%] h-full flex flex-col bg-[#0d1117] relative z-20">
          
          {/* Sticky Header */}
          <div className="flex items-start justify-between p-6 md:p-8 border-b border-white/[0.05] shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] badge-font block mb-2">
                Case Study
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white badge-font">
                {project.title}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors ml-4"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            
            <p className="text-white/60 leading-relaxed text-sm md:text-base mb-8 whitespace-pre-wrap">
              {project.longDesc}
            </p>

            {/* Tech Stack */}
            <div className="mb-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 badge-font mb-4">
                Architecture & Stack
              </h4>
              <div className="flex gap-2.5 flex-wrap">
                {project.tags.map((tag) => {
                  const TagIcon = tag.icon;
                  return (
                    <span
                      key={tag.name}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-white/[0.04] text-white/60 border border-white/[0.08] badge-font select-none"
                    >
                      <TagIcon size={12} />
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3 mt-auto pt-4">
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 transition-all"
              >
                <ExternalLink size={16} className="text-[var(--primary)] group-hover:scale-110 transition-transform" />
                Live Deployment
              </a>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-transparent border border-white/5 text-white/60 font-medium text-sm hover:bg-white/[0.03] hover:text-white transition-all"
                >
                  <Github size={16} className="group-hover:scale-110 transition-transform" />
                  Source Code
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};


// ── Main Page Component ──────────────────────────────────────────────────
export const Projects = ({ language }: { language: Language }) => {
  const t = translations[language].sections;
  const heroT = translations[language].hero;

  const sectionRef   = useRef<HTMLElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs      = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const pillRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const meshRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const promoPulseRef = useRef<HTMLDivElement>(null);
  const promoCardRef  = useRef<HTMLDivElement>(null);
  const borderRefs    = useRef<(SVGRectElement | null)[]>([]);
  const borderLengthRef = useRef<number[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects: Project[] = [
    {
      title: "TesisFar",
      desc: t.projects.tesisFar.desc,
      longDesc: "TesisFar is a comprehensive Pharmacy Thesis Management System engineered to streamline the workflow between students, advisors, and administration.\n\nBuilt with Next.js and Django, it replaces legacy paper-driven trails with a highly responsive, glassmorphic dashboard. Key features include real-time analytics, automated document routing, and granular role-based access controls.",
      image: "/proj-tesisfar.jpg",
      gallery: [
        "/proj-tesisfar.jpg",
        "/tesisfar_gallery_1.png",
        "/tesisfar_gallery_2.png"
      ],
      tags: [
        { name: "Next.js",  icon: SiNextdotjs },
        { name: "Tailwind", icon: SiTailwindcss },
        { name: "GSAP",     icon: SiGreensock },
        { name: "Django",   icon: SiDjango },
      ],
      meshSeed: 1,
      href: "#",
      github: "#",
    },
    {
      title: "EchoPlan",
      desc: t.projects.echoPlan.desc,
      longDesc: "EchoPlan is an enterprise-grade Agile project management tool engineered specifically for remote, asynchronous software teams.\n\nIt features an interactive, drag-and-drop Gantt chart timeline view, real-time kanban boards, and deeply integrated communication threads. The React frontend is heavily optimized to render thousands of DOM nodes at a smooth 60fps.",
      image: "/proj-echoplan.jpg",
      gallery: [
        "/proj-echoplan.jpg",
        "/echoplan_gallery_1.png",
        "/echoplan_gallery_2.png"
      ],
      tags: [
        { name: "React",    icon: SiReact },
        { name: "Tailwind", icon: SiTailwindcss },
        { name: "Django",   icon: SiDjango },
        { name: "MySQL",    icon: SiPostgresql },
      ],
      meshSeed: 2,
      href: "#",
      github: "#",
    },
  ];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const canHover = window.matchMedia("(hover: hover)").matches;

      // ── Gradient Mesh Slow-Float ───────────────────────────────────────────
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

      // ── Ghost Border — measure total length ───────────────────────────────
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

      // ── Hidden states: overlay pill starts 20px below ─────────────────────
      pillRefs.current.forEach((pill) => {
        if (pill) gsap.set(pill, { y: 20, autoAlpha: 0 });
      });
      overlayRefs.current.forEach((ov) => {
        if (ov) gsap.set(ov, { opacity: 0 });
      });

      // ── Per-Card: 3D Tilt + Spotlight + Image Parallax + Hover Overlay ────
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const inner  = card.querySelector<HTMLDivElement>(".proj-card-inner");
        const border = borderRefs.current[i];
        const img    = imgRefs.current[i];
        const overlay = overlayRefs.current[i];
        const pill    = pillRefs.current[i];
        if (!inner) return;

        const setX = gsap.quickTo(inner, "rotationY", { duration: 0.55, ease: "power3.out" });
        const setY = gsap.quickTo(inner, "rotationX", { duration: 0.55, ease: "power3.out" });

        // Image parallax quickTo — counters the card tilt for depth illusion
        const setImgX = img ? gsap.quickTo(img, "x", { duration: 0.6, ease: "power3.out" }) : null;
        const setImgY = img ? gsap.quickTo(img, "y", { duration: 0.6, ease: "power3.out" }) : null;

        const onMove = (e: MouseEvent) => {
          if (!canHover) return;
          const rect = inner.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          inner.style.setProperty("--mouse-x", `${x}px`);
          inner.style.setProperty("--mouse-y", `${y}px`);

          const cx = rect.width  / 2;
          const cy = rect.height / 2;
          const rotY = gsap.utils.clamp(-4, 4, ((x - cx) / cx) * 4);
          const rotX = gsap.utils.clamp(-4, 4, ((y - cy) / cy) * -4);

          setX(rotY);
          setY(rotX);

          // Image moves opposite to card tilt — creates "window" depth
          if (setImgX && setImgY) {
            setImgX(rotY * -2.5);
            setImgY(rotX *  2.5);
          }
        };

        const onEnter = () => {
          if (!canHover) return;
          // Draw ghost border
          if (border) {
            gsap.to(border, { strokeDashoffset: 0, duration: 0.65, ease: "power3.out" });
            gsap.to(border, { opacity: 0.75, duration: 0.3 });
          }
          // Scale image in slightly
          if (img) gsap.to(img, { scale: 1.08, duration: 0.6, ease: "power3.out" });
          // Reveal overlay + lift pill
          if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.35 });
          if (pill)    gsap.to(pill,    { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" });
        };

        const onLeave = () => {
          if (!canHover) return;
          setX(0);
          setY(0);
          inner.style.setProperty("--mouse-x", "-1000px");
          inner.style.setProperty("--mouse-y", "-1000px");
          // Erase ghost border
          if (border) {
            const len = borderLengthRef.current[i] ?? 1200;
            gsap.to(border, { strokeDashoffset: len, duration: 0.5, ease: "power2.in" });
            gsap.to(border, { opacity: 0, duration: 0.3, delay: 0.2 });
          }
          // Reset image
          if (img) {
            gsap.to(img, { scale: 1, x: 0, y: 0, duration: 0.55, ease: "power3.out" });
          }
          // Hide overlay + push pill back down
          if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
          if (pill)    gsap.to(pill, { y: 20, autoAlpha: 0, duration: 0.25 });
        };

        card.addEventListener("mousemove",  onMove);
        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
      });

      // ── Promo Card: orbiting background pulse ──────────────────────────────
      if (promoPulseRef.current) {
        gsap.set(promoPulseRef.current, { opacity: 0.3 });
        gsap.to(promoPulseRef.current, {
          x: 120, y: -60, duration: 8, ease: "sine.inOut", repeat: -1, yoyo: true,
        });
        gsap.to(promoPulseRef.current, {
          scale: 1.2, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2,
        });
      }

      // ── Promo Card: 3D tilt + spotlight ───────────────────────────────────
      if (promoCardRef.current) {
        const promoInner = promoCardRef.current.querySelector<HTMLDivElement>(".proj-card-inner");
        if (promoInner) {
          const setX = gsap.quickTo(promoInner, "rotationY", { duration: 0.6, ease: "power3.out" });
          const setY = gsap.quickTo(promoInner, "rotationX", { duration: 0.6, ease: "power3.out" });
          const onMove = (e: MouseEvent) => {
            if (!canHover) return;
            const rect = promoInner.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            promoInner.style.setProperty("--mouse-x", `${x}px`);
            promoInner.style.setProperty("--mouse-y", `${y}px`);
            setX(gsap.utils.clamp(-4, 4, ((x - rect.width  / 2) / (rect.width  / 2)) * 3));
            setY(gsap.utils.clamp(-4, 4, ((y - rect.height / 2) / (rect.height / 2)) * -3));
          };
          const onLeave = () => {
            setX(0); setY(0);
            promoInner.style.setProperty("--mouse-x", "-1000px");
            promoInner.style.setProperty("--mouse-y", "-1000px");
          };
          promoCardRef.current.addEventListener("mousemove",  onMove);
          promoCardRef.current.addEventListener("mouseleave", onLeave);
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
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
                {/* Ghost Border SVG */}
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
                  className="proj-card-inner relative w-full rounded-[24px] bg-[#0d1117] border border-white/10 overflow-hidden flex flex-col cursor-pointer no-cursor-snap"
                  style={{ willChange: "transform", transformStyle: "preserve-3d" }}
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Spotlight */}
                  <div
                    className="pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[24px]"
                    style={{
                      background: "radial-gradient(circle 500px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255,255,255,0.06) 0%, transparent 60%)",
                    }}
                  />

                  {/* ── Media Viewport ─────────────────────────────────────── */}
                  <div
                    ref={(el) => { meshRefs.current[i] = el; }}
                    className="relative w-full overflow-hidden bg-[#161b22] rounded-t-[24px]"
                    style={{ height: "220px" }}
                  >
                    {/* z-0 Mesh fallback */}
                    <GeometricMesh seed={project.meshSeed} />

                    {/* z-10 Project image */}
                    <img
                      ref={(el) => { imgRefs.current[i] = el; }}
                      src={project.image}
                      alt={`${project.title} preview`}
                      className="absolute inset-0 w-full h-full object-cover z-10 will-change-transform"
                      style={{ transformOrigin: "center center" }}
                      loading="lazy"
                    />

                    {/* Bottom vignette */}
                    <div
                      className="absolute inset-0 z-[12] pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, transparent 35%, #0d1117 100%)" }}
                    />

                    {/* Hover overlay — Case Study Pill */}
                    <div
                      ref={(el) => { overlayRefs.current[i] = el; }}
                      className="absolute inset-0 z-[15] flex items-center justify-center bg-[#0b0e14]/60 backdrop-blur-[2px] pointer-events-none"
                    >
                      <div
                        ref={(el) => { pillRefs.current[i] = el; }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] badge-font shadow-lg shadow-black/50"
                      >
                        <Eye size={14} className="text-[var(--primary)]" />
                        View Case Study
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 flex items-center gap-2 z-[16]">
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 badge-font">
                        Project Preview
                      </span>
                    </div>

                    {/* External Link overrides modal click via stopPropagation */}
                    <a
                      href={project.href}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`View ${project.title}`}
                      className="absolute top-4 right-4 z-[16] flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/10 hover:scale-110"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={14} className="text-white/60" />
                    </a>
                  </div>

                  {/* ── Content Zone ───────────────────────────────────────── */}
                  <div className="flex flex-col flex-1 p-7 gap-5 relative z-10 pointer-events-none">
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight badge-font">
                      {project.title}
                    </h3>
                    <p className="text-white/50 text-base leading-relaxed flex-1">
                      {project.desc}
                    </p>

                    <div className="flex gap-2.5 flex-wrap pt-1">
                      {project.tags.map((tag) => {
                        const TagIcon = tag.icon;
                        return (
                          <span
                            key={tag.name}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.08] transition-all duration-200 badge-font"
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

            {/* ── Promo Card ──────────────────────────────────────────────── */}
            <div
              ref={promoCardRef}
              className="stagger-item lg:col-span-2 group relative mt-4"
              style={{ perspective: "1200px" }}
            >
              <div
                className="proj-card-inner relative w-full rounded-[24px] bg-[#0d1117] border border-white/10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-14 cursor-default"
                style={{ willChange: "transform", transformStyle: "preserve-3d" }}
              >
                {/* Spotlight */}
                <div
                  className="pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[24px]"
                  style={{
                    background: "radial-gradient(circle 600px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255,255,255,0.05) 0%, transparent 60%)",
                  }}
                />
                <div
                  ref={promoPulseRef}
                  className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-[var(--primary)]/10 blur-[100px] pointer-events-none -z-10 rounded-full"
                  style={{ opacity: 0.3 }}
                />
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.025]"
                  style={{
                    backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }}
                />

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
                      { label: "Fluid Motion",        Icon: Sparkles },
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
      
      {/* ── Render Case Study Modal via Portal ───────────────────────────── */}
      <CaseStudyModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </>
  );
};
