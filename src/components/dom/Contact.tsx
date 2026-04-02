import { useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Linkedin, Github, Terminal } from "lucide-react";
import { Language, translations } from "../../constants/translations";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "aoshi_blanco@outlook.com";

// Glitch phases shown during copy feedback
const GLITCH_PHASE_1 = "0x4F50454E 0x464F5220 0x434F4C4C";
const GLITCH_PHASE_2 = "> [SYS_MSG: COPIED_TO_CLIPBOARD]";

// ── Inline MagneticElement (wide radius for the email block) ─────────────────
const MagneticWrap = ({
  children,
  className = "",
  radius = 120,
  strength = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < radius) {
      gsap.to(innerRef.current, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(innerRef.current, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1,0.4)",
        overwrite: "auto",
      });
    }
  }, [radius, strength]);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1,0.4)",
      overwrite: "auto",
    });
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
    >
      <div ref={innerRef} className="origin-center">
        {children}
      </div>
    </div>
  );
};

// ── Social link with magnetic spring ─────────────────────────────────────────
const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => {
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < 60) {
      gsap.to(innerRef.current, {
        x: dx * 0.35,
        y: dy * 0.35,
        duration: 0.26,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      duration: 0.55,
      ease: "elastic.out(1,0.4)",
      overwrite: "auto",
    });
  }, []);

  return (
    <a
      ref={wrapRef}
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group p-3 -m-3"
    >
      <span
        ref={innerRef}
        className="flex items-center gap-3 text-white/30 group-hover:text-[var(--primary)] transition-colors duration-300"
      >
        <Icon size={18} className="flex-shrink-0" />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase badge-font group-hover:text-white/80 transition-colors">
          {label}
        </span>
      </span>
    </a>
  );
};

export const Contact = ({ language }: { language: Language }) => {
  const t = translations[language].sections;
  const heroT = translations[language].hero;

  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLSpanElement>(null);
  const emailBtnRef = useRef<HTMLButtonElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const cursorLineRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  // ── ScrollTrigger reveal + infinite marquee ──────────────────────────────
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial hidden states
      gsap.set([badgeRef.current, titleRef.current, subtitleRef.current, emailBtnRef.current], {
        autoAlpha: 0,
        y: 40,
      });
      gsap.set(marqueeRef.current, { autoAlpha: 0 });
      if (socialsRef.current) {
        gsap.set(socialsRef.current.children, { autoAlpha: 0, y: 24 });
      }

      // ── Staggered section reveal ───────────────────────────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          // 1. Marquee fades in first
          tl.to(marqueeRef.current, { autoAlpha: 1, duration: 0.9 }, 0);

          // 2. HUD badge
          tl.to(badgeRef.current, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.2);

          // 3. Title
          tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.35);

          // 4. Subtitle
          tl.to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.48);

          // 5. Email button
          tl.to(emailBtnRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.56);

          // 6. Social links — elastic pop from bottom
          if (socialsRef.current) {
            tl.to(
              socialsRef.current.children,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "elastic.out(1,0.5)",
              },
              0.68
            );
          }
        },
      });

      // ── Infinite marquee via GSAP ──────────────────────────────────────
      if (marqueeInnerRef.current) {
        // Duplicate content so loop is seamless
        const inner = marqueeInnerRef.current;
        // Clone is already in JSX as two identical spans — just animate
        gsap.to(inner, {
          xPercent: -50,
          duration: 28,
          ease: "none",
          repeat: -1,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Glitch-copy feedback ──────────────────────────────────────────────────
  const handleCopyEmail = useCallback(() => {
    if (isAnimatingRef.current || !emailRef.current) return;
    isAnimatingRef.current = true;

    navigator.clipboard.writeText(EMAIL).catch(() => {});

    const el = emailRef.current;
    const tl = gsap.timeline({
      onComplete: () => { isAnimatingRef.current = false; },
    });

    // Step 1: scramble to hex glitch string
    tl.call(() => {
      el.style.color = "var(--primary)";
      animateText(el, GLITCH_PHASE_1, 0.4);
    }, [], 0);

    // Step 2: resolve to SYS_MSG
    tl.call(() => {
      animateText(el, GLITCH_PHASE_2, 0.35);
    }, [], 0.55);

    // Step 3: hold, then scramble back to email
    tl.call(() => {
      el.style.color = "";
      animateText(el, EMAIL, 0.5);
    }, [], 2.6);
  }, []);

  // Frame-by-frame character scrambler
  function animateText(el: HTMLElement, target: string, duration: number) {
    const CHARS = "0123456789ABCDEF_.[]:></ ";
    const state = { progress: 0 };
    gsap.to(state, {
      progress: 1,
      duration,
      ease: "power2.inOut",
      onUpdate() {
        const revealed = Math.floor(target.length * state.progress);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          if (i < revealed || target[i] === " ") {
            out += target[i];
          } else {
            out += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        el.textContent = out;
      },
      onComplete() {
        el.textContent = target;
      },
    });
  }

  // ── Cursor blink animation ────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!cursorLineRef.current) return;
    gsap.to(cursorLineRef.current, {
      autoAlpha: 0,
      duration: 0.5,
      ease: "steps(1)",
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-5"
      className="min-h-[100dvh] flex flex-col justify-center px-8 md:px-16 lg:px-24 pb-40 pt-32 relative overflow-hidden bg-transparent"
    >
      {/* ── Infinite Background Marquee ────────────────────────────────────── */}
      <div
        ref={marqueeRef}
        aria-hidden="true"
        className="absolute inset-0 flex items-center pointer-events-none overflow-hidden select-none"
        style={{ opacity: 0 }}
      >
        <div
          ref={marqueeInnerRef}
          className="flex whitespace-nowrap will-change-transform"
          style={{ width: "200%" }}
        >
          {/* Two copies for seamless loop */}
          <span
            className="badge-font font-black uppercase italic text-white/[0.028] tracking-[0.05em] flex-shrink-0"
            style={{ fontSize: "clamp(4rem, 10vw, 9rem)" }}
          >
            {" "}// OPEN FOR COLLABORATION // SYSTEMS INITIALIZED // AVAILABLE NOW //{" "}
          </span>
          <span
            className="badge-font font-black uppercase italic text-white/[0.028] tracking-[0.05em] flex-shrink-0"
            style={{ fontSize: "clamp(4rem, 10vw, 9rem)" }}
          >
            {" "}// OPEN FOR COLLABORATION // SYSTEMS INITIALIZED // AVAILABLE NOW //{" "}
          </span>
        </div>
      </div>

      {/* ── Section Content ────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">

        {/* HUD badge */}
        <div
          ref={badgeRef}
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md"
          style={{ opacity: 0 }}
        >
          <Terminal size={13} />
          {t.contact.tag}
        </div>

        {/* Title */}
        <h2
          ref={titleRef}
          className="badge-font font-black tracking-tighter text-white leading-[0.92] mb-6"
          style={{ fontSize: "clamp(2.8rem, 9vw, 7rem)", opacity: 0 }}
        >
          {heroT.letsTalk}
        </h2>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-white/40 font-light leading-relaxed mb-14 max-w-lg"
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", opacity: 0 }}
        >
          {language === "en"
            ? "I'm always open to discussing new projects, creative ideas, or being part of your visions."
            : "Siempre estoy dispuesto a discutir nuevos proyectos, ideas creativas o formar parte de tus visiones."}
        </p>

        {/* ── Magnetic Email Button ────────────────────────────────────────── */}
        <MagneticWrap radius={120} strength={0.15} className="block mb-16">
          <button
            ref={emailBtnRef}
            onClick={handleCopyEmail}
            aria-label="Copy email address to clipboard"
            className="no-cursor-snap group relative text-left w-fit block"
            style={{ opacity: 0 }}
          >
            {/* Terminal prompt prefix */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[var(--primary)]/40 text-xs font-mono tracking-widest badge-font">
                CONTACT://
              </span>
              <span className="text-white/20 text-[10px] badge-font uppercase tracking-[0.2em]">
                click to copy
              </span>
            </div>

            {/* Giant email address */}
            <div className="relative flex items-baseline gap-3">
              <span
                ref={emailRef}
                data-final-text={EMAIL}
                className="block font-bold text-white group-hover:text-[var(--primary)] transition-colors duration-300 font-mono"
                style={{ fontSize: "clamp(1.2rem, 4.5vw, 3.8rem)" }}
              >
                {EMAIL}
              </span>
              {/* Blinking terminal cursor */}
              <div
                ref={cursorLineRef}
                className="self-stretch w-[2px] bg-[var(--primary)] rounded-full flex-shrink-0"
                style={{ minHeight: "1em" }}
              />
            </div>

            {/* Underline rule */}
            <div className="mt-3 h-px w-full bg-white/10 group-hover:bg-[var(--primary)]/40 transition-colors duration-500" />
          </button>
        </MagneticWrap>

        {/* ── Social Links ─────────────────────────────────────────────────── */}
        <div ref={socialsRef} className="flex items-center gap-10">
          <SocialLink
            href="https://linkedin.com"
            icon={Linkedin}
            label="LinkedIn"
          />
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />
          <SocialLink
            href="https://github.com"
            icon={Github}
            label="GitHub"
          />
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />
          <SocialLink
            href={`mailto:${EMAIL}`}
            icon={Mail}
            label="Email"
          />
        </div>

        {/* ── System status line ────────────────────────────────────────────── */}
        <div className="mt-20 flex items-center gap-3 text-white/15 text-[10px] font-mono tracking-[0.2em] uppercase">
          <span className="w-6 h-px bg-white/15" />
          <span>SYS::PORTFOLIO v1.0.0 — AOSHI BLANCO — ALL SYSTEMS NOMINAL</span>
          <span className="w-6 h-px bg-white/15" />
        </div>
      </div>
    </section>
  );
};
