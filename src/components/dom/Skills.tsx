import { useState, useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, ChevronDown } from "lucide-react";
import {
  SiReact, SiNextdotjs, SiThreedotjs, SiGreensock, SiNodedotjs,
  SiPython, SiPostgresql, SiDjango, SiTailwindcss,
} from "react-icons/si";
import { Language, translations } from "../../constants/translations";
import { scrambleText } from "../../utils/textEffects";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────
const SKILLS = [
  { name: "React",    icon: SiReact },
  { name: "Next.js",  icon: SiNextdotjs },
  { name: "Three.js", icon: SiThreedotjs },
  { name: "GSAP",     icon: SiGreensock },
  { name: "Node.js",  icon: SiNodedotjs },
  { name: "Python",   icon: SiPython },
  { name: "SQL",      icon: SiPostgresql },
  { name: "Django",   icon: SiDjango },
  { name: "Tailwind", icon: SiTailwindcss },
] as const;

// Dynamic file extensions per skill
const FILE_EXT: Record<string, string> = {
  "React":    "react_module.tsx",
  "Next.js":  "next_app.tsx",
  "Three.js": "scene_setup.ts",
  "GSAP":     "animation.ts",
  "Node.js":  "server.js",
  "Python":   "script.py",
  "SQL":      "database.sql",
  "Django":   "views.py",
  "Tailwind": "styles.css",
};

// Code snippets per skill (2 lines, syntax-hinted as plain strings)
const CODE_SNIPPETS: Record<string, { lines: { token: string; color: string }[][] }> = {
  "React":    { lines: [[{ token: "const", color: "#c678dd" }, { token: " App ", color: "#abb2bf" }, { token: "=", color: "#56b6c2" }, { token: " () =>", color: "#c678dd" }, { token: " <Root />", color: "#e06c75" }], [{ token: "export default", color: "#c678dd" }, { token: " App", color: "#61afef" }]] },
  "Next.js":  { lines: [[{ token: "export default", color: "#c678dd" }, { token: " function", color: "#c678dd" }, { token: " Page", color: "#61afef" }, { token: "()", color: "#abb2bf" }, { token: " {}", color: "#abb2bf" }], [{ token: "// App Router · RSC", color: "#5c6370" }]] },
  "Three.js": { lines: [[{ token: "const", color: "#c678dd" }, { token: " scene ", color: "#abb2bf" }, { token: "=", color: "#56b6c2" }, { token: " new", color: "#c678dd" }, { token: " THREE.Scene()", color: "#61afef" }], [{ token: "renderer", color: "#abb2bf" }, { token: ".render(", color: "#56b6c2" }, { token: "scene, camera", color: "#e5c07b" }, { token: ")", color: "#abb2bf" }]] },
  "GSAP":     { lines: [[{ token: "gsap", color: "#61afef" }, { token: ".to(", color: "#56b6c2" }, { token: "el", color: "#e5c07b" }, { token: ", { x:", color: "#abb2bf" }, { token: " 100", color: "#d19a66" }, { token: ", ease:", color: "#abb2bf" }, { token: ' "power3"', color: "#98c379" }, { token: " })", color: "#abb2bf" }], [{ token: "// 120fps · GPU composited", color: "#5c6370" }]] },
  "Node.js":  { lines: [[{ token: "app", color: "#61afef" }, { token: ".get(", color: "#56b6c2" }, { token: '"/api"', color: "#98c379" }, { token: ", (req, res) =>", color: "#abb2bf" }, { token: " {}", color: "#abb2bf" }], [{ token: "// Express · REST · async", color: "#5c6370" }]] },
  "Python":   { lines: [[{ token: "def", color: "#c678dd" }, { token: " solve", color: "#61afef" }, { token: "(n: int)", color: "#abb2bf" }, { token: " -> list:", color: "#c678dd" }], [{ token: "    return", color: "#c678dd" }, { token: " dp[n]", color: "#e5c07b" }, { token: "  # O(n)", color: "#5c6370" }]] },
  "SQL":      { lines: [[{ token: "SELECT", color: "#c678dd" }, { token: " u.name", color: "#abb2bf" }, { token: ", COUNT(*)", color: "#56b6c2" }, { token: " AS total", color: "#abb2bf" }], [{ token: "FROM", color: "#c678dd" }, { token: " users u", color: "#61afef" }, { token: " JOIN", color: "#c678dd" }, { token: " orders", color: "#61afef" }, { token: " USING(id);", color: "#abb2bf" }]] },
  "Django":   { lines: [[{ token: "class", color: "#c678dd" }, { token: " PostView", color: "#61afef" }, { token: "(", color: "#abb2bf" }, { token: "APIView", color: "#e5c07b" }, { token: "):", color: "#abb2bf" }], [{ token: "    serializer_class", color: "#abb2bf" }, { token: " = ", color: "#56b6c2" }, { token: "PostSerializer", color: "#61afef" }]] },
  "Tailwind": { lines: [[{ token: '<div', color: "#e06c75" }, { token: ' className=', color: "#abb2bf" }, { token: '"flex', color: "#98c379" }, { token: " gap-4", color: "#98c379" }, { token: ' rounded-2xl">', color: "#98c379" }], [{ token: "  // utility-first · zero runtime", color: "#5c6370" }]] },
};

// ─── Types ───────────────────────────────────────────────────────────────────
type SkillData = { name: string; icon: any; desc: string };
type CardHandle = { dim: () => void; undim: () => void };

// ─── Card styles ─────────────────────────────────────────────────────────────
const CARD_STYLES = `
  .skc { position: relative; perspective: 600px; }
  .skc-inner { transform-style: preserve-3d; will-change: transform; }
  .skc::before {
    content: ""; position: absolute; inset: -1px; border-radius: 1rem; padding: 1px;
    background: radial-gradient(circle 130px at var(--mx,-300px) var(--my,-300px), rgba(255,255,255,0.18), transparent 45%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none; opacity: 0; transition: opacity 0.25s ease; z-index: 2;
  }
  .skc:hover::before { opacity: 1; }
  @keyframes blink-cursor {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  .term-cursor { animation: blink-cursor 0.8s step-end infinite; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SkillCard Component
// ─────────────────────────────────────────────────────────────────────────────
const SkillCard = ({
  skill, desc, isActive, onHover, isMobile,
  registerHandle, expandedMobile, onMobileExpand,
}: {
  skill: SkillData; desc: string; isActive: boolean;
  onHover: (s: SkillData) => void; isMobile: boolean;
  registerHandle: (name: string, h: CardHandle) => void;
  expandedMobile: string | null; onMobileExpand: (name: string | null) => void;
}) => {
  const cardRef     = useRef<HTMLDivElement>(null);
  const innerRef    = useRef<HTMLDivElement>(null);
  const iconWrapRef = useRef<HTMLDivElement>(null);
  const accordRef   = useRef<HTMLDivElement>(null);

  // Register dim handle
  useLayoutEffect(() => {
    registerHandle(skill.name, {
      dim:   () => gsap.to(cardRef.current, { opacity: 0.4, filter: "blur(1.5px)", duration: 0.3, ease: "power2.out", overwrite: "auto" }),
      undim: () => gsap.to(cardRef.current, { opacity: 1,   filter: "blur(0px)",   duration: 0.3, ease: "power2.out", overwrite: "auto" }),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3D tilt + magnetic drift — (hover: hover) gated
  useLayoutEffect(() => {
    if (!innerRef.current || !cardRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(hover: hover)", () => {
      const xTo  = gsap.quickTo(innerRef.current, "x",         { duration: 0.4, ease: "power3", overwrite: "auto" });
      const yTo  = gsap.quickTo(innerRef.current, "y",         { duration: 0.4, ease: "power3", overwrite: "auto" });
      const rxTo = gsap.quickTo(innerRef.current, "rotationX", { duration: 0.5, ease: "power3", overwrite: "auto" });
      const ryTo = gsap.quickTo(innerRef.current, "rotationY", { duration: 0.5, ease: "power3", overwrite: "auto" });
      const ixTo = gsap.quickTo(iconWrapRef.current, "x", { duration: 0.35, ease: "power3", overwrite: "auto" });
      const iyTo = gsap.quickTo(iconWrapRef.current, "y", { duration: 0.35, ease: "power3", overwrite: "auto" });

      const onMove = (e: MouseEvent) => {
        const r = cardRef.current!.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        const nx = dx / (r.width / 2); const ny = dy / (r.height / 2);
        xTo(Math.max(-8, Math.min(8, dx * 0.12))); yTo(Math.max(-8, Math.min(8, dy * 0.12)));
        rxTo(Math.max(-8, Math.min(8, -ny * 8)));  ryTo(Math.max(-8, Math.min(8, nx * 8)));
        ixTo(Math.max(-5, Math.min(5, dx * 0.04))); iyTo(Math.max(-5, Math.min(5, dy * 0.04)));
        cardRef.current!.style.setProperty("--mx", `${e.clientX - r.left}px`);
        cardRef.current!.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      const onLeave = () => { xTo(0); yTo(0); rxTo(0); ryTo(0); ixTo(0); iyTo(0); };
      const onDown  = () => gsap.to(innerRef.current, { scale: 0.96, duration: 0.12, ease: "power2.in",  overwrite: "auto" });
      const onUp    = () => gsap.to(innerRef.current, { scale: 1,    duration: 0.4,  ease: "back.out(2)", overwrite: "auto" });

      cardRef.current!.addEventListener("mousemove", onMove);
      cardRef.current!.addEventListener("mouseleave", onLeave);
      cardRef.current!.addEventListener("mousedown", onDown);
      cardRef.current!.addEventListener("mouseup",   onUp);
      return () => {
        cardRef.current?.removeEventListener("mousemove", onMove);
        cardRef.current?.removeEventListener("mouseleave", onLeave);
        cardRef.current?.removeEventListener("mousedown", onDown);
        cardRef.current?.removeEventListener("mouseup",   onUp);
      };
    });
    return () => mm.revert();
  }, []);

  // Active focus border
  useLayoutEffect(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      boxShadow: isActive
        ? "inset 0 0 28px rgba(143,245,255,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
        : "inset 0 1px 0 rgba(255,255,255,0.02)",
      borderColor: isActive ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)",
      duration: 0.4, ease: "power2.out", overwrite: "auto",
    });
    if (iconWrapRef.current)
      gsap.to(iconWrapRef.current, {
        color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
        duration: 0.3, ease: "power2.out", overwrite: "auto",
      });
  }, [isActive]);

  // Mobile accordion
  const isExpanded = expandedMobile === skill.name;
  useLayoutEffect(() => {
    if (!accordRef.current) return;
    gsap.to(accordRef.current, {
      height: isExpanded ? accordRef.current.scrollHeight : 0,
      opacity: isExpanded ? 1 : 0,
      duration: isExpanded ? 0.38 : 0.26,
      ease: isExpanded ? "power3.out" : "power3.in",
      overwrite: "auto",
    });
  }, [isExpanded]);

  const handleMouseEnter = () => {
    onHover({ ...skill, desc });
    gsap.to(cardRef.current, { backgroundColor: "rgba(255,255,255,0.035)", duration: 0.25, ease: "power2.out" });
    if (iconWrapRef.current)
      gsap.to(iconWrapRef.current, { scale: 1.12, rotation: 5, color: "#ffffff", duration: 0.3, ease: "back.out(2)" });
  };
  const handleMouseLeave = () => {
    if (!isActive) {
      gsap.to(cardRef.current, { backgroundColor: "#0d1117", duration: 0.3, ease: "power2.out" });
      if (iconWrapRef.current)
        gsap.to(iconWrapRef.current, { scale: 1, rotation: 0, color: "rgba(255,255,255,0.4)", duration: 0.3, ease: "power2.out" });
    }
  };

  const Icon = skill.icon;

  if (isMobile) {
    return (
      <div className="rounded-2xl bg-[#0d1117] border border-white/10 overflow-hidden">
        <button
          onClick={() => onMobileExpand(isExpanded ? null : skill.name)}
          className="w-full p-5 flex items-center gap-4 cursor-pointer"
        >
          <div className="text-white/50"><Icon size={26} /></div>
          <span className="text-white/70 text-sm font-semibold tracking-wide flex-1 text-left">{skill.name}</span>
          <div style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
            <ChevronDown size={16} className="text-white/30" />
          </div>
        </button>
        <div ref={accordRef} style={{ height: 0, opacity: 0, overflow: "hidden" }}>
          <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="skc p-0.5 rounded-2xl bg-[#0d1117] border border-white/10
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] cursor-pointer transform-gpu"
      style={{ "--mx": "-300px", "--my": "-300px" } as React.CSSProperties}
    >
      <div ref={innerRef} className="skc-inner p-6 rounded-[calc(1rem-2px)] flex flex-col items-center justify-center gap-4 h-full">
        <div ref={iconWrapRef} className="text-white/40" style={{ willChange: "transform" }}>
          <Icon size={32} />
        </div>
        <span className="text-white/60 text-sm font-semibold tracking-wide">{skill.name}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Terminal Window Component
// ─────────────────────────────────────────────────────────────────────────────
const TerminalWindow = ({
  skill,
  terminalRef,
  contentRef,
  titleLineRef,
  descLinesRef,
  snippetRef,
  watermarkRef,
}: {
  skill: SkillData;
  terminalRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  titleLineRef: React.RefObject<HTMLDivElement | null>;
  descLinesRef: React.RefObject<HTMLDivElement | null>;
  snippetRef: React.RefObject<HTMLDivElement | null>;
  watermarkRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const filename   = FILE_EXT[skill.name] ?? "module.ts";
  const snippet    = CODE_SNIPPETS[skill.name];
  const Icon       = skill.icon;
  const isActive   = true; // always rendered in active context

  return (
    <div
      ref={terminalRef}
      className="w-full rounded-2xl overflow-hidden border border-white/10
                 bg-[#0b0e14] shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{ willChange: "transform", minHeight: "380px", perspective: "800px" }}
    >
      {/* ── Terminal header bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] bg-white/[0.015] select-none">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {/* File tab */}
        <div className="ml-2 flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">
          <span className="text-[11px] font-mono text-white/50">{filename}</span>
          <span className="term-cursor text-[11px] font-mono text-[#28c840]">█</span>
        </div>
        {/* Spacer + skill badge */}
        <div className="ml-auto text-[10px] font-mono text-white/20 tracking-widest uppercase">
          {skill.name}
        </div>
      </div>

      {/* ── Terminal body ──────────────────────────────────────────────────── */}
      <div className="relative p-6 font-mono overflow-hidden" style={{ minHeight: "330px" }}>

        {/* Watermark icon */}
        <div
          ref={watermarkRef}
          className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none"
          style={{ opacity: 0.045 }}
        >
          <Icon size={160} style={{ transform: "rotate(-12deg)" }} />
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} className="relative z-10" style={{ willChange: "transform, opacity" }}>

          {/* Prompt + title */}
          <div ref={titleLineRef} className="flex items-baseline gap-2 mb-3" style={{ willChange: "transform, opacity" }}>
            <span className="text-[#28c840] text-sm select-none">❯</span>
            <span className="text-[10px] text-white/30 font-mono select-none">root@aoshi:~$</span>
            <span className="text-white font-mono text-sm font-bold tracking-wider uppercase">
              {skill.name}
            </span>
          </div>

          {/* Description lines */}
          <div ref={descLinesRef} className="pl-5 mb-5 space-y-0.5" style={{ willChange: "transform, opacity" }}>
            {skill.desc.split(". ").filter(Boolean).map((sentence, i) => (
              <div key={i} className="flex gap-2 text-[13px] leading-relaxed">
                <span className="text-white/20 select-none text-[11px] mt-[2px] shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-white/55">{sentence}{i < skill.desc.split(". ").filter(Boolean).length - 1 ? "." : ""}</span>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          {snippet && (
            <div
              ref={snippetRef}
              className="pl-5 rounded-lg bg-white/[0.03] border border-white/[0.06] p-3"
              style={{ willChange: "transform, opacity" }}
            >
              {snippet.lines.map((line, li) => (
                <div key={li} className="flex items-center gap-0 text-[12px] leading-[1.8]">
                  <span className="text-white/20 select-none text-[10px] mr-3 shrink-0">{li + 1}</span>
                  {line.map((token, ti) => (
                    <span key={ti} style={{ color: token.color }}>{token.token}</span>
                  ))}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Skills Export
// ─────────────────────────────────────────────────────────────────────────────
export const Skills = ({ language }: { language: Language }) => {
  const t           = translations[language].sections;
  const initialDesc = t.skillDescriptions[SKILLS[0].name as keyof typeof t.skillDescriptions] || "";

  // ── Two-phase state model ─────────────────────────────────────────────────
  // phase 1: handleHover sets activeSkillName → triggers fade-out → onComplete sets renderedSkill
  // phase 2: useLayoutEffect([renderedSkill]) fires entrance animation (guaranteed post-render)
  const [renderedSkill,   setRenderedSkill]   = useState<SkillData>({ ...SKILLS[0], desc: initialDesc });
  const [activeSkillName, setActiveSkillName] = useState<string>(SKILLS[0].name);
  const [isMobileView,    setIsMobileView]    = useState(false);
  const [expandedMobile,  setExpandedMobile]  = useState<string | null>(null);

  // Latest requested skill — written synchronously in handleHover
  const pendingSkillRef = useRef<SkillData>({ ...SKILLS[0], desc: initialDesc });
  const isFadingRef     = useRef(false);

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const sectionRef    = useRef<HTMLElement>(null);
  const terminalRef   = useRef<HTMLDivElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);
  const titleLineRef  = useRef<HTMLDivElement>(null);
  const descLinesRef  = useRef<HTMLDivElement>(null);
  const snippetRef    = useRef<HTMLDivElement>(null);
  const watermarkRef  = useRef<HTMLDivElement>(null);

  // Card dim registry
  const cardHandles  = useRef<Record<string, CardHandle>>({});
  const registerHandle = useCallback((name: string, h: CardHandle) => { cardHandles.current[name] = h; }, []);

  // ── Mobile detection ──────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(max-width: 767px)", () => { setIsMobileView(true);  return () => setIsMobileView(false); });
    mm.add("(min-width: 768px)", () => { setIsMobileView(false); return () => setIsMobileView(true); });
    return () => mm.revert();
  }, []);

  // ── Terminal 3D tilt — tracks mouse anywhere in section ──────────────────
  useLayoutEffect(() => {
    if (!terminalRef.current || !sectionRef.current) return;
    const mm = gsap.matchMedia();
    mm.add("(hover: hover)", () => {
      const rxTo = gsap.quickTo(terminalRef.current, "rotationX", { duration: 0.6, ease: "power3", overwrite: "auto" });
      const ryTo = gsap.quickTo(terminalRef.current, "rotationY", { duration: 0.6, ease: "power3", overwrite: "auto" });

      const onMove = (e: MouseEvent) => {
        const r  = sectionRef.current!.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const ny = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        ryTo(nx * 4);
        rxTo(-ny * 3);
      };
      const onLeave = () => { rxTo(0); ryTo(0); };

      sectionRef.current!.addEventListener("mousemove",  onMove);
      sectionRef.current!.addEventListener("mouseleave", onLeave);
      return () => {
        sectionRef.current?.removeEventListener("mousemove",  onMove);
        sectionRef.current?.removeEventListener("mouseleave", onLeave);
      };
    });
    return () => mm.revert();
  }, []);

  // ── Boot sequence (once on scroll into view) ──────────────────────────────
  useLayoutEffect(() => {
    if (!sectionRef.current || !terminalRef.current || !contentRef.current) return;

    // Set initial hidden states
    gsap.set(terminalRef.current, { scale: 0.9, opacity: 0 });
    gsap.set(contentRef.current,  { opacity: 0 });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   "top 70%",
      once:    true,
      onEnter: () => {
        const tl = gsap.timeline();
        // Terminal scales up
        tl.to(terminalRef.current, {
          scale: 1, opacity: 1, duration: 0.7, ease: "power3.out",
        })
          // Cursor blinks 3×, then content fades in
          .to(contentRef.current, {
            opacity: 1, duration: 0.4, ease: "power2.out",
          }, "+=0.2");
      },
    });
    return () => ScrollTrigger.getAll().forEach(st => { if (st.vars.trigger === sectionRef.current) st.kill(); });
  }, []);

  // ── PHASE 1: handleHover — only triggers fade-out then setRenderedSkill ───
  const handleHover = useCallback((skillData: SkillData) => {
    // Always write latest pending target synchronously
    pendingSkillRef.current = skillData;
    setActiveSkillName(skillData.name);

    // Focus dim
    Object.entries(cardHandles.current).forEach(([name, h]) => {
      if (name === skillData.name) h.undim(); else h.dim();
    });

    // If already fading, just update pendingSkillRef — onComplete will pick up latest
    if (isFadingRef.current) return;
    if (skillData.name === renderedSkill.name) return;

    isFadingRef.current = true;

    // Fade OUT content
    gsap.to([titleLineRef.current, descLinesRef.current, snippetRef.current], {
      opacity: 0,
      x: -16,
      stagger: 0.04,
      duration: 0.18,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        // Set React state — guaranteed to use latest pending target from ref
        setRenderedSkill(pendingSkillRef.current);
        // isFadingRef stays true — reset in phase 2's useLayoutEffect
      },
    });
  // renderedSkill.name is used for same-skill early exit guard only
  }, [renderedSkill.name]);

  // ── PHASE 2: Entrance animation — fires after React re-renders new data ───
  const isFirstRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    // Swap watermark icon (instant — it's behind content)
    // React has already rendered new RenderedIcon by this point ✓

    // Animate content IN
    gsap.fromTo(
      [titleLineRef.current, descLinesRef.current, snippetRef.current],
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.06,
        duration: 0.28,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => { isFadingRef.current = false; },
      }
    );

    // Scramble title
    const titleEl = titleLineRef.current?.querySelector(".skill-title-text") as HTMLElement | null;
    if (titleEl) scrambleText(titleEl);

  }, [renderedSkill.name]); // ← fires every time renderedSkill changes

  const handleGridLeave = useCallback(() => {
    Object.values(cardHandles.current).forEach(h => h.undim());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-3"
      className="min-h-screen py-24 px-8 md:px-24 relative overflow-hidden flex items-center bg-transparent"
    >
      <style>{CARD_STYLES}</style>

      <div className="reveal-content w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">

        {/* ── LEFT: Systems Terminal (hidden on mobile) ────────────────────── */}
        <div className="hidden lg:block select-none" style={{ perspective: "800px" }}>
          <TerminalWindow
            skill={renderedSkill}
            terminalRef={terminalRef}
            contentRef={contentRef}
            titleLineRef={titleLineRef}
            descLinesRef={descLinesRef}
            snippetRef={snippetRef}
            watermarkRef={watermarkRef}
          />
        </div>

        {/* ── RIGHT: Section heading + grid ───────────────────────────────── */}
        <div className="text-right lg:text-left max-w-xl lg:max-w-none lg:ml-auto pointer-events-auto">
          <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20
                          text-[var(--tertiary)] text-[10px] md:text-xs font-bold
                          tracking-[0.2em] uppercase badge-font lg:ml-0 ml-auto">
            <Cpu size={14} /> {t.skills.tag}
          </div>

          <h2 className="stagger-item text-5xl md:text-7xl font-bold text-white mb-8 italic uppercase badge-font tracking-tighter">
            <div className="overflow-hidden">
              <span className="block reveal-text">{t.skills.title}</span>
            </div>
          </h2>

          <div
            className={isMobileView ? "flex flex-col gap-3" : "grid grid-cols-2 md:grid-cols-3 gap-4"}
            onMouseLeave={isMobileView ? undefined : handleGridLeave}
          >
            {SKILLS.map((skill) => {
              const desc = t.skillDescriptions[skill.name as keyof typeof t.skillDescriptions] || "";
              return (
                <SkillCard
                  key={skill.name}
                  skill={{ ...skill, desc }}
                  desc={desc}
                  isActive={activeSkillName === skill.name}
                  onHover={handleHover}
                  isMobile={isMobileView}
                  registerHandle={registerHandle}
                  expandedMobile={expandedMobile}
                  onMobileExpand={setExpandedMobile}
                />
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
