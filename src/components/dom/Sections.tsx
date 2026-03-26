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

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const scrambleText = (element: HTMLElement, duration = 0.62) => {
  const finalText = element.dataset.finalText ?? element.textContent ?? "";
  element.dataset.finalText = finalText;

  const state = { progress: 0 };
  gsap.to(state, {
    progress: 1,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      const revealCount = Math.floor(finalText.length * state.progress);
      let output = "";

      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        const isFixed = ch === " " || ch === "-" || ch === "_";

        if (isFixed || i < revealCount) {
          output += ch;
        } else {
          output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      element.textContent = output;
    },
    onComplete: () => {
      element.textContent = finalText;
    },
  });
};

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
  const xToRef = useRef<((value: number) => void) | null>(null);
  const yToRef = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    xToRef.current = gsap.quickTo(contentRef.current, "x", {
      duration: 0.16,
      ease: "power4.out",
    });
    yToRef.current = gsap.quickTo(contentRef.current, "y", {
      duration: 0.16,
      ease: "power4.out",
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || !contentRef.current) return;
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
    xToRef.current?.(x);
    yToRef.current?.(y);
  };

  const handleMouseLeave = () => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      x: 0,
      y: 0,
      duration: 0.28,
      ease: "back.out(1.8)",
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

const SplitText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <span className={`inline-block whitespace-nowrap ${className}`}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="reveal-text inline-block"
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
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
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      gsap.defaults({ overwrite: "auto" });

      // 1. HERO ANIMATIONS (Section 1)
      const heroTl = gsap.timeline();
      
      // Headlines Reveal (Clip-path Mask)
      heroTl.from(".hero-title .reveal-text", {
        y: "100%",
        rotate: 5,
        stagger: 0.05,
        duration: 1.5,
        ease: "expo.out",
      }).from(".hero-role .reveal-text", {
        y: "110%",
        skewY: 10,
        stagger: 0.03,
        duration: 1.2,
        ease: "power4.out",
      }, "-=1.2");

      // Hero Parallax Scrub
      gsap.to(".hero-parallax-target", {
        y: -150,
        opacity: 0,
        scrollTrigger: {
          trigger: "#section-1",
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });

      // 2. EXPERIENCE ANIMATIONS (Section 2)
      mm.add("(min-width: 768px)", () => {
        // Experience Line Drawing
        gsap.to(".experience-line", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "#section-2",
            start: "top center",
            end: "bottom center",
            scrub: true,
          }
        });

        // Card Reveals as line passes
        const cardElements = gsap.utils.toArray(".experience-card");
        cardElements.forEach((card: any) => {
          gsap.from(card, {
            scale: 0.95,
            rotate: 2,
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          });
        });
      });

      // 3. SKILLS ANIMATIONS (Section 3)
      const skillsTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#section-3",
          start: "top 80%",
        }
      });

      skillsTl.from(".skills-title .reveal-text", {
        y: "120%",
        stagger: 0.03,
        duration: 1,
        ease: "expo.out"
      }).from(".skill-card", {
        y: 60,
        opacity: 0,
        rotateX: -45,
        stagger: {
          each: 0.05,
          grid: "auto",
          from: "start"
        },
        duration: 1,
        ease: "back.out(1.7)"
      }, "-=0.6");

      // Skills Grid Parallax
      gsap.to(".skills-container", {
        y: -100,
        scrollTrigger: {
          trigger: "#section-3",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

      // 4. PROJECTS ANIMATIONS (Section 4 - Horizontal Scroll)
      mm.add("(min-width: 768px)", () => {
        const horizontalSections = gsap.utils.toArray(".project-card-horizontal");
        
        const scrollTween = gsap.to(".horizontal-scroll-container", {
          xPercent: -100 * (horizontalSections.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: "#section-4",
            pin: true,
            scrub: 1,
            end: () => `+=${(containerRef.current?.querySelector(".horizontal-scroll-container") as HTMLElement).offsetWidth}`,
            invalidateOnRefresh: true,
          }
        });

        // Child animations within horizontal scroll
        horizontalSections.forEach((sec: any, i) => {
          if (i === 0) return; // Skip title section or animate it differently
          
          gsap.from(sec.querySelector(".project-card"), {
            opacity: 0,
            scale: 0.8,
            rotateY: 15,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sec,
              containerAnimation: scrollTween,
              start: "left 80%",
              toggleActions: "play none none reverse",
            }
          });
        });
      });

      // MOBILE FALLBACK for Projects
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray(".project-card").forEach((card: any) => {
          gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            }
          });
        });
      });

      // 5. CONTACT (Footer Reveal Effect)
      // This is primarily CSS with the sticky positioning, 
      // but we can add an opacity fade to the main content as it reveals
      gsap.from(".footer-content", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: "#section-5",
          start: "top bottom",
          end: "top 60%",
          scrub: true,
        }
      });

    }, containerRef);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, [loaded]);

  return (
    <div ref={containerRef} className="w-full bg-transparent">
      <div className="main-wrapper bg-[#0b0e14]">
        {/* Section 1: Hero */}
        <section
          id="section-1"
          className="h-screen flex items-center justify-start px-12 md:px-24 relative overflow-hidden bg-transparent"
        >
          <div className="hero-content max-w-2xl relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)] badge-font mb-4">
              <div className="mask-reveal">
                <SplitText text="Aoshi Blanco" className="uppercase italic hero-title" />
              </div>
            </h1>
            <h2 className="text-[clamp(2.2rem,6.4vw,4.8rem)] md:text-[clamp(2.9rem,7.5vw,5.75rem)] font-black tracking-tighter text-white leading-[1] badge-font mb-8 max-w-[min(90vw,18ch)] md:max-w-[min(90vw,22ch)]">
              <div className="mask-reveal">
                 <SplitText text={translations[language].hero.role.split(' ')[0]} className="hero-role" />
              </div>
              <div className="mask-reveal">
                 <SplitText text={translations[language].hero.role.split(' ').slice(1).join(' ')} className="hero-role outline-text" />
              </div>
            </h2>
            <div className="hero-parallax-target">
              <p className="text-xl md:text-2xl text-white/50 mt-4 font-light leading-relaxed">
                {translations[language].hero.bio}
              </p>
              <div className="mt-12 flex items-center gap-6">
                <button 
                  onClick={() => document.getElementById('section-4')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hero-cta px-8 py-4 bg-white text-[#0b0e14] font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 group shadow-2xl"
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
          </div>
        </section>

        {/* Section 2: Experience */}
        <section
          id="section-2"
          className="min-h-screen py-32 px-12 md:px-24 relative overflow-hidden flex flex-col items-center bg-transparent"
        >
          {/* Vertical Progress Line */}
          <div className="absolute left-12 md:left-24 top-0 bottom-0 w-px bg-white/5 overflow-hidden hidden md:block">
            <div className="experience-line w-full h-full bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)] origin-top scale-y-0" />
          </div>

          <div className="w-full max-w-7xl mx-auto relative z-10 md:pl-16">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
              <Briefcase size={14} /> {t.experience.tag}
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-16 tracking-tighter badge-font">
              <div className="mask-reveal">
                 <SplitText text={t.experience.title} className="uppercase italic experience-title" />
              </div>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {t.experience.roles.map((item, i) => (
                <div
                  key={i}
                  className="experience-card group p-6 md:p-8 lg:p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.07] transition-all duration-500 shadow-2xl flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="mb-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] md:text-xs tracking-[0.15em] font-bold uppercase badge-font mb-6">
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
          className="min-h-screen py-24 px-12 md:px-24 relative overflow-hidden flex items-center bg-transparent"
        >
          <div className="skills-container w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
            <div className="hidden md:block pointer-events-none">
              {(() => {
                const Icon = desktopPreviewSkill.icon;
                return (
                  <div className="skills-preview transition-all duration-500 ease-out">
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

            <div className="text-right md:text-left max-w-xl md:max-w-none md:ml-auto">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md md:ml-0 ml-auto">
                <Cpu size={14} /> {t.skills.tag}
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 italic uppercase badge-font tracking-tighter">
                <div className="mask-reveal">
                  <SplitText text={t.skills.title} className="skills-title" />
                </div>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 skills-grid">
                {SKILLS.map((skill) => {
                  const Icon = skill.icon;
                  const skillDesc = t.skillDescriptions[skill.name as keyof typeof t.skillDescriptions] || "";
                  return (
                    <div
                      key={skill.name}
                      onMouseEnter={() => setHoveredSkill({ ...skill, desc: skillDesc })}
                      onMouseLeave={() => setHoveredSkill(null)}
                      className="skill-card group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 backdrop-blur-md"
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
          className="horizontal-scroll-section min-h-screen relative overflow-hidden flex items-center bg-transparent py-20"
        >
          <div className="horizontal-scroll-container">
            <div className="project-card-horizontal flex flex-col justify-center h-full">
               <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
                  <Layout size={14} /> {t.projects.tag}
                </div>
                <h2 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tighter badge-font uppercase italic">
                  <div className="mask-reveal">
                    <SplitText text={t.projects.title} className="projects-title" />
                  </div>
                </h2>
                <p className="text-white/40 text-xl font-light">Scroll horizontally to explore</p>
                <div className="mt-8 flex items-center gap-4 text-[var(--primary)]">
                  <ChevronRight size={24} className="animate-pulse" />
                </div>
              </div>
            </div>

            {[
              {
                title: "TesisFar",
                desc: t.projects.tesisFar.desc,
                className: "tesisfar-card",
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
                className={`project-card-horizontal flex items-center`}
              >
                <div className={`project-card ${project.className || ''} group relative p-10 md:p-16 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.07] transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-2xl w-full aspect-[16/10] md:aspect-[21/9]`}>
                  <div className="scanning-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="w-full h-full flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-4xl md:text-7xl font-bold text-white group-hover:text-[var(--primary)] transition-colors badge-font uppercase">
                          {project.title}
                        </h3>
                        <a href="#" aria-label={`View ${project.title} project`}>
                          <ExternalLink size={32} className="text-white/20 group-hover:text-white transition-colors" />
                        </a>
                      </div>
                      <p className="text-white/50 text-xl md:text-2xl font-light leading-relaxed mb-10 max-w-2xl">
                        {project.desc}
                      </p>
                      <div className="flex gap-4 flex-wrap">
                        {project.tags.map((tag) => {
                          const TagIcon = tag.icon;
                          return (
                            <span
                              key={tag.name}
                              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/5 text-white/50 border border-white/10"
                            >
                              <TagIcon size={14} />
                              {tag.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Section 5: Contact (Footer Reveal) */}
      <section
        id="section-5"
        className="footer-reveal-section flex items-center justify-start px-12 md:px-24 pb-48 overflow-hidden bg-[#07090d]"
      >
        <div className="max-w-xl relative z-10 footer-content">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
            <Mail size={14} /> {t.contact.tag}
          </div>
          <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter badge-font">
            {translations[language].hero.letsTalk}
          </h2>
          <p className="text-white/40 text-xl font-light mb-12 leading-relaxed">
            I'm always open to discussing new projects, creative ideas, or being part of your visions.
          </p>
          <div className="flex flex-col gap-8">
            <button
              onClick={handleCopyEmail}
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
      <div className="fixed bottom-14 left-4 md:bottom-16 md:left-8 right-4 md:right-8 flex flex-row flex-wrap justify-between items-center gap-3 text-white/50 text-xs md:text-sm font-semibold tracking-widest uppercase z-[210] pointer-events-none">
        <span className="flex items-center gap-2">
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
        </span>
        <span>{formattedTime} {t.contact.time}</span>
      </div>

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
    </div>
  );
}
