import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Laptop,
  Cpu,
  Layout,
  Mail,
  ChevronRight,
  Github,
  Linkedin,
  ExternalLink,
  Code2,
  Sparkles,
  Zap,
  Briefcase,
} from "lucide-react";
import {
  SiReact,
  SiNextdotjs,
  SiThreedotjs,
  SiGreensock,
  SiNodedotjs,
  SiPython,
  SiPostgresql,
  SiDjango,
  SiTailwindcss,
} from "react-icons/si";
import { Language, translations } from "../../constants/translations";

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  { name: "React", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "Three.js", icon: SiThreedotjs },
  { name: "GSAP", icon: SiGreensock },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Python", icon: SiPython },
  { name: "SQL", icon: SiPostgresql },
  { name: "Django", icon: SiDjango },
  { name: "Tailwind", icon: SiTailwindcss },
];

const MagneticButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || !contentRef.current) return;
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.4;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.4;
    gsap.to(contentRef.current, { x, y, duration: 0.8, ease: "power3.out" });
  };

  const handleMouseLeave = () => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <a
      ref={rootRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group p-4 -m-4"
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

export default function Sections({ language, loaded }: { language: Language, loaded: boolean }) {
  const t = translations[language].sections;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<{ name: string; icon: any; desc: string } | null>(null);
  const [activeSection, setActiveSection] = useState(1);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time
    ? time.toLocaleTimeString(language === 'en' ? "en-US" : "es-ES", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Loading...";

  const desktopPreviewSkill =
    hoveredSkill ?? {
      ...SKILLS[0],
      desc: t.skillDescriptions[SKILLS[0].name as keyof typeof t.skillDescriptions] || "",
    };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("aoshi_blanco@outlook.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>("section");

    sections.forEach((section, index) => {
      const content = section.querySelector(".reveal-content");
      const items = section.querySelectorAll(".stagger-item");
      const revealTexts = section.querySelectorAll(".reveal-text");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse",
          onEnter: () => setActiveSection(index + 1),
          onEnterBack: () => setActiveSection(index + 1),
        },
      });

      if (revealTexts.length > 0) {
        tl.fromTo(revealTexts, 
          { y: "110%", rotate: 3 }, 
          { y: "0%", rotate: 0, duration: 0.9, stagger: 0.15, ease: "expo.out" }
        );
      }

      tl.fromTo(content, { y: 100, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, ease: "expo.out" }, "-=0.6");

      if (items.length > 0) {
        tl.fromTo(
          items,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "expo.out" },
          "-=0.6",
        );

        // Animate Ghost Borders
        const ghostBorders = section.querySelectorAll(".ghost-border");
        if (ghostBorders.length > 0) {
          tl.fromTo(ghostBorders, 
            { strokeDashoffset: 1000, opacity: 0 }, 
            { strokeDashoffset: 0, opacity: 1, duration: 2, ease: "slow(0.7, 0.7, false)" }, 
            "-=1.2"
          );
        }
      }
    });
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col relative z-10 w-full">
      {/* HUD Navigation - Floating Island at the bottom */}
      {typeof document !== 'undefined' && createPortal(
        <div className={`fixed left-1/2 -translate-x-1/2 bottom-8 flex items-center gap-1 p-1.5 rounded-2xl bg-[#1c2028]/80 border border-white/10 backdrop-blur-2xl z-[100] transition-all duration-1000 shadow-2xl ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
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
              {num === 1 ? (language === 'en' ? 'HOME' : 'INICIO') : num === 2 ? t.experience.tag : num === 3 ? t.skills.tag : num === 4 ? t.projects.tag : t.contact.tag}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Section 1: Hero */}
      <section
        id="section-1"
        className="h-screen flex items-center justify-start px-12 md:px-24 relative overflow-hidden"
      >

        <div className="reveal-content max-w-2xl relative z-10">
          <h1 className="stagger-item text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)] badge-font mb-4">
            <div className="overflow-hidden">
              <span className="block reveal-text uppercase italic">Aoshi Blanco</span>
            </div>
          </h1>
          <h2 className="stagger-item text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] badge-font mb-8">
            <div className="overflow-hidden">
               <span className="block reveal-text">CREATIVE</span>
            </div>
            <div className="overflow-hidden">
               <span className="block reveal-text outline-text">ENGINEER</span>
            </div>
          </h2>
          <p className="stagger-item text-xl md:text-2xl text-white/50 mt-4 font-light leading-relaxed">
            {translations[language].hero.bio}
          </p>
          <div className="stagger-item mt-12 flex items-center gap-6">
            <button 
               onClick={() => document.getElementById('section-4')?.scrollIntoView({ behavior: 'smooth' })}
               className="px-8 py-4 bg-white text-[#0b0e14] font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 group shadow-2xl"
            >
              {translations[language].hero.viewWork}{" "}
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <div className="flex gap-4 text-white/40">
              <a href="https://github.com" aria-label="GitHub Profile" target="_blank" rel="noopener noreferrer">
                <Github size={20} className="hover:text-white cursor-pointer transition-colors" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn Profile" target="_blank" rel="noopener noreferrer">
                <Linkedin size={20} className="hover:text-white cursor-pointer transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Experience */}
      <section
        id="section-2"
        className="min-h-screen py-32 px-12 md:px-24 relative overflow-hidden flex items-center"
      >
        <div className="reveal-content w-full max-w-7xl mx-auto relative z-10">
          <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
            <Briefcase size={14} /> {t.experience.tag}
          </div>
          <h2 className="stagger-item text-5xl md:text-7xl font-bold text-white mb-16 tracking-tighter badge-font">
            <div className="overflow-hidden">
               <span className="block reveal-text uppercase italic">{t.experience.title}</span>
            </div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {t.experience.roles.map((item, i) => (
              <div
                key={i}
                className="stagger-item group p-6 md:p-8 lg:p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.07] hover:-translate-y-2 hover:border-white/20 transition-all duration-500 shadow-2xl flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Ghost Border SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <rect 
                    x="0" y="0" width="100%" height="100%" 
                    rx="24" ry="24"
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="1" 
                    className="ghost-border opacity-20"
                    style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                  />
                </svg>

                <div className="mb-auto relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] md:text-xs tracking-[0.15em] font-bold uppercase badge-font mb-6 shadow-[0_0_15px_rgba(143,245,255,0.05)]">
                    {item.company}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight leading-snug">
                    {item.role}
                  </h3>
                  <p className="text-white/60 font-light leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-white/40 text-[10px] md:text-xs font-semibold uppercase tracking-widest relative z-10">
                  <span>{item.date}</span>
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
                    </span>
                    {t.experience.active}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Skills */}
      <section
        id="section-3"
        className="min-h-screen py-24 px-12 md:px-24 relative overflow-hidden flex items-center"
      >
        <div className="reveal-content w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          <div className="hidden md:block pointer-events-none">
            {(() => {
              const Icon = desktopPreviewSkill.icon;
              return (
                <div className="transition-all duration-500 ease-out">
                  <Icon size={86} className="text-white/12 mb-8" />
                  <h3 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                    {desktopPreviewSkill.name}
                  </h3>
                  <p className="text-white/45 text-xl lg:text-2xl font-light leading-relaxed max-w-xl">
                    {desktopPreviewSkill.desc}
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="text-right md:text-left max-w-xl md:max-w-none md:ml-auto pointer-events-auto">
            <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md md:ml-0 ml-auto">
              <Cpu size={14} /> {t.skills.tag}
            </div>
            <h2 className="stagger-item text-5xl md:text-7xl font-bold text-white mb-8 italic uppercase badge-font tracking-tighter">
              <div className="overflow-hidden">
                <span className="block reveal-text">{t.skills.title}</span>
              </div>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SKILLS.map((skill) => {
                const Icon = skill.icon;
                const skillDesc = t.skillDescriptions[skill.name as keyof typeof t.skillDescriptions] || "";
                return (
                  <div
                    key={skill.name}
                    onMouseEnter={() => setHoveredSkill({ ...skill, desc: skillDesc })}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className="stagger-item group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 backdrop-blur-md"
                  >
                    <Icon
                      size={32}
                      className="text-white/40 group-hover:text-white transition-colors duration-300"
                    />
                    <span className="text-white/60 group-hover:text-white text-sm font-semibold tracking-wide transition-colors duration-300">
                      {skill.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Projects */}
      <section
        id="section-4"
        className="min-h-screen py-32 px-12 md:px-24 relative overflow-hidden flex items-center"
      >
        <div className="reveal-content relative z-10 w-full max-w-6xl mx-auto">
          <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
            <Layout size={14} /> {t.projects.tag}
          </div>
          <h2 className="stagger-item text-5xl md:text-7xl font-bold text-white mb-16 tracking-tighter badge-font uppercase italic">
            <div className="overflow-hidden">
              <span className="block reveal-text">{t.projects.title}</span>
            </div>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: "TesisFar",
                desc: t.projects.tesisFar.desc,
                tags: [
                  { name: "Next.js", icon: SiNextdotjs },
                  { name: "Tailwind", icon: SiTailwindcss },
                  { name: "GSAP", icon: SiGreensock },
                  { name: "Django", icon: SiDjango },
                ],
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
              },
            ].map((project, i) => (
              <div
                key={i}
                className="stagger-item group relative p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Ghost Border SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <rect 
                    x="0" y="0" width="100%" height="100%" 
                    rx="24" ry="24"
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="1" 
                    className="ghost-border opacity-20"
                    style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                  />
                </svg>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl font-bold text-white group-hover:text-white/80 transition-colors">
                      {project.title}
                    </h3>
                    <a href="#" aria-label={`View ${project.title} project`}>
                      <ExternalLink size={24} className="text-white/20 group-hover:text-white transition-colors" />
                    </a>
                  </div>
                  <p className="text-white/50 text-xl font-light leading-relaxed mb-10">
                    {project.desc}
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {project.tags.map((tag) => {
                    const TagIcon = tag.icon;
                    return (
                      <span
                        key={tag.name}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-default badge-font"
                      >
                        <TagIcon size={12} />
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Personalized Websites Promo Card */}
            <div className="stagger-item lg:col-span-2 group relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-xl hover:bg-white/[0.12] transition-colors flex flex-col md:flex-row items-center justify-between gap-8 mt-4 overflow-hidden cursor-default">
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[80px] pointer-events-none -z-10 rounded-full" />

              <div className="text-left max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-4 mb-8">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]"></span>
                  </span>
                  <span className="text-white/60 text-sm font-semibold uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">
                    {t.projects.personalized.status}
                  </span>
                </div>

                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {t.projects.personalized.title}
                </h3>
                <p className="text-white/60 text-xl font-light leading-relaxed mb-10 group-hover:text-white/80 transition-colors duration-500">
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
                      className="flex items-center gap-2 text-white/40 text-xs md:text-sm font-bold tracking-[0.1em] border border-white/10 px-4 py-2 rounded-full bg-white/5 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white/90 transition-all duration-300 badge-font"
                    >
                      <Icon size={16} className="text-[var(--primary)]/50 group-hover:text-[var(--primary)] transition-colors" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => document.getElementById('section-5')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative z-10 whitespace-nowrap px-8 py-5 bg-gradient-to-br from-[var(--secondary)] to-[var(--tertiary)] text-black text-lg font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-lg shadow-[var(--secondary)]/10"
              >
                {translations[language].hero.letsTalk}{" "}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Contact */}
      <section
        id="section-5"
        className="min-h-screen flex items-center justify-start px-12 md:px-24 pb-48 relative overflow-hidden"
      >
        <div className="reveal-content max-w-xl relative z-10">
          <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
            <Mail size={14} /> {t.contact.tag}
          </div>
          <h2 className="stagger-item text-4xl md:text-6xl font-bold text-white mb-8">
            {translations[language].hero.letsTalk}
          </h2>
          <p className="stagger-item text-white/40 text-xl font-light mb-12 leading-relaxed">
            I'm always open to discussing new projects, creative ideas, or being part of your visions.
          </p>
          <div className="stagger-item flex flex-col gap-8">
            <button
              onClick={handleCopyEmail}
              aria-label={copied ? t.contact.copied : "Copy email address to clipboard"}
              className="group text-left text-4xl md:text-5xl font-bold text-white transition-all pb-4 inline-block w-fit relative"
            >
              <span className={`block transition-all duration-500 ${copied ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
                aoshi_blanco@outlook.com
              </span>
              <span className={`absolute left-0 top-0 text-[var(--primary)] block transition-all duration-500 ${copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
                {t.contact.copied} ✓
              </span>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 group-hover:bg-white/40 transition-colors" />
            </button>

            <div className="flex gap-12 text-white/40 font-medium tracking-wide mt-4">
              <MagneticButton href="#" aria-label="LinkedIn Profile">
                <Linkedin size={20} className="text-white/30 group-hover:text-white transition-all" aria-hidden="true" />
                <span className="group-hover:text-white transition-all">LINKEDIN</span>
              </MagneticButton>
              <MagneticButton href="#" aria-label="GitHub Profile">
                <Github size={20} className="text-white/30 group-hover:text-white transition-all" aria-hidden="true" />
                <span className="group-hover:text-white transition-all">GITHUB</span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing & Live Footer */}
      <div className="h-[20vh] relative">
        <div className="absolute bottom-8 left-12 md:left-24 right-12 md:right-24 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs md:text-sm font-semibold tracking-widest uppercase z-10 pointer-events-none">
          <div className="flex items-center justify-center md:justify-start gap-3 md:flex-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            {t.contact.based}{" "}
            {Intl.DateTimeFormat(language === 'en' ? "en-US" : "es-ES")
              .resolvedOptions()
              .timeZone.split("/")
              .pop()
              ?.replace("_", " ") || "Your City"}
          </div>

          <div className="md:flex-1 text-center text-white/50 lowercase">
            {t.contact.developedBy} Aoshi Blanco
          </div>

          <div className="md:flex-1 text-center md:text-right">
            {formattedTime} {t.contact.time}
          </div>
        </div>
      </div>
    </div>
  );
}
