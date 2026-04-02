import { useLayoutEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Linkedin, Github, Terminal, Send, Loader2, Check } from "lucide-react";
import emailjs from "@emailjs/browser";
import { Language, translations } from "../../constants/translations";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "a.blanco1501@gmail.com";

// ── EmailJS config — fill in your own IDs ───────────────────────────────────
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";

// Glitch phases for copy feedback
const GLITCH_PHASE_1 = "0x4F50454E 0x464F5220 0x434F4C4C";
const GLITCH_PHASE_2 = "> [SYS_MSG: COPIED_TO_CLIPBOARD]";

// ── Frame-by-frame hex/binary scrambler ─────────────────────────────────────
function animateText(el: HTMLElement, target: string, duration: number, onDone?: () => void) {
  const CHARS = "0123456789ABCDEF_.[]:<>/ ";
  const state = { progress: 0 };
  gsap.to(state, {
    progress: 1,
    duration,
    ease: "power2.inOut",
    onUpdate() {
      const revealed = Math.floor(target.length * state.progress);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out += i < revealed || target[i] === " "
          ? target[i]
          : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
    },
    onComplete() {
      el.textContent = target;
      onDone?.();
    },
  });
}

// ── Magnetic wrapper ─────────────────────────────────────────────────────────
const MagneticWrap = ({
  children, className = "", radius = 120, strength = 0.15,
}: { children: React.ReactNode; className?: string; radius?: number; strength?: number }) => {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width  / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    gsap.to(innerRef.current, {
      x: Math.hypot(dx, dy) < radius ? dx * strength : 0,
      y: Math.hypot(dx, dy) < radius ? dy * strength : 0,
      duration: 0.3, ease: "power2.out", overwrite: "auto",
    });
  }, [radius, strength]);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)", overwrite: "auto" });
  }, []);

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} className={`inline-block ${className}`}>
      <div ref={innerRef} className="origin-center">{children}</div>
    </div>
  );
};

// ── Social link ──────────────────────────────────────────────────────────────
const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
  const wrapRef  = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width  / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    if (Math.hypot(dx, dy) < 60)
      gsap.to(innerRef.current, { x: dx * 0.35, y: dy * 0.35, duration: 0.26, ease: "power2.out", overwrite: "auto" });
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1,0.4)", overwrite: "auto" });
  }, []);

  return (
    <a ref={wrapRef} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
      onMouseMove={onMove} onMouseLeave={onLeave} className="group p-3 -m-3">
      <span ref={innerRef} className="flex items-center gap-3 text-white/30 group-hover:text-[var(--primary)] transition-colors duration-300">
        <Icon size={18} className="flex-shrink-0" />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase badge-font group-hover:text-white/80 transition-colors">{label}</span>
      </span>
    </a>
  );
};

// ── Mail Compose Field ───────────────────────────────────────────────────────
const MailField = ({
  label, type = "text", placeholder, value, onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex items-center gap-4 px-6 py-3 min-h-[44px] border-b border-white/5 transition-colors">
      <span className={`text-sm select-none transition-colors duration-300 w-16 flex-shrink-0 ${isFocused ? "text-[var(--primary)]" : "text-white/40"}`}>
        {label}
      </span>
      <input
        type={type}
        className="no-cursor-snap flex-1 bg-transparent outline-none text-white text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const Contact = ({ language }: { language: Language }) => {
  const t     = translations[language].sections;
  const heroT = translations[language].hero;

  // Reveal refs
  const sectionRef       = useRef<HTMLElement>(null);
  const marqueeRef       = useRef<HTMLDivElement>(null);
  const marqueeInnerRef  = useRef<HTMLDivElement>(null);
  const badgeRef         = useRef<HTMLDivElement>(null);
  const titleRef         = useRef<HTMLHeadingElement>(null);
  const subtitleRef      = useRef<HTMLParagraphElement>(null);
  const emailBtnRef      = useRef<HTMLButtonElement>(null);
  const socialsRef       = useRef<HTMLDivElement>(null);
  const cursorLineRef    = useRef<HTMLDivElement>(null);
  const formColRef       = useRef<HTMLDivElement>(null);

  // Email copy refs
  const emailRef       = useRef<HTMLSpanElement>(null);
  const isAnimatingRef = useRef(false);

  // Form submit state
  type SubmitState = "idle" | "sending" | "success" | "error";
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const planeIconRef = useRef<SVGSVGElement>(null);

  // Form state
  const [fromEmail, setFromEmail] = useState("");
  const [subject,   setSubject]   = useState("");
  const [message,   setMessage]   = useState("");

  // ── ScrollTrigger reveal + infinite marquee ──────────────────────────────
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [badgeRef.current, titleRef.current, subtitleRef.current, emailBtnRef.current],
        { autoAlpha: 0, y: 40 }
      );
      gsap.set(marqueeRef.current,  { autoAlpha: 0 });
      gsap.set(formColRef.current,  { autoAlpha: 0, y: 50 });
      if (socialsRef.current)
        gsap.set(socialsRef.current.children, { autoAlpha: 0, y: 24 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.to(marqueeRef.current, { autoAlpha: 1, duration: 0.9 }, 0);
          tl.to(badgeRef.current,   { autoAlpha: 1, y: 0, duration: 0.65 }, 0.2);
          tl.to(titleRef.current,   { autoAlpha: 1, y: 0, duration: 0.7 },  0.35);
          tl.to(subtitleRef.current,{ autoAlpha: 1, y: 0, duration: 0.6 },  0.48);
          tl.to(emailBtnRef.current,{ autoAlpha: 1, y: 0, duration: 0.7 },  0.56);
          if (socialsRef.current)
            tl.to(socialsRef.current.children, {
              autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "elastic.out(1,0.5)",
            }, 0.68);
          // Right column slides in
          tl.to(formColRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.4);
        },
      });

      // Infinite marquee
      if (marqueeInnerRef.current)
        gsap.to(marqueeInnerRef.current, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });

      // Cursor blink
      if (cursorLineRef.current)
        gsap.to(cursorLineRef.current, { autoAlpha: 0, duration: 0.5, ease: "steps(1)", repeat: -1, yoyo: true });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Glitch email copy ─────────────────────────────────────────────────────
  const handleCopyEmail = useCallback(() => {
    if (isAnimatingRef.current || !emailRef.current) return;
    isAnimatingRef.current = true;
    navigator.clipboard.writeText(EMAIL).catch(() => {});
    const el = emailRef.current;
    const tl = gsap.timeline({ onComplete: () => { isAnimatingRef.current = false; } });
    tl.call(() => { el.style.color = "var(--primary)"; animateText(el, GLITCH_PHASE_1, 0.4); }, [], 0);
    tl.call(() => { animateText(el, GLITCH_PHASE_2, 0.35); }, [], 0.55);
    tl.call(() => { el.style.color = ""; animateText(el, EMAIL, 0.5); }, [], 2.6);
  }, []);

  // ── Compose Window submit ──────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitState !== "idle") return;

    // 1. Plane fly-out animation
    if (planeIconRef.current) {
      await gsap.to(planeIconRef.current, {
        x: 20, y: -20, opacity: 0, duration: 0.4, ease: "power2.in"
      });
    }

    setSubmitState("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { from_email: fromEmail, subject, message },
        EMAILJS_PUBLIC_KEY
      );
      
      setSubmitState("success");
      
      // Reset after success
      setTimeout(() => {
        setSubmitState("idle");
        setFromEmail(""); setSubject(""); setMessage("");
        if (planeIconRef.current) {
          gsap.set(planeIconRef.current, { x: 0, y: 0, opacity: 1 });
        }
      }, 3000);
      
    } catch {
      setSubmitState("error");
      setTimeout(() => {
        setSubmitState("idle");
        if (planeIconRef.current) {
          gsap.set(planeIconRef.current, { x: 0, y: 0, opacity: 1 });
        }
      }, 3000);
    }
  }, [fromEmail, subject, message, submitState]);

  return (
    <section
      ref={sectionRef}
      id="section-5"
      className="min-h-[100dvh] flex flex-col justify-center px-8 md:px-16 lg:px-24 pb-40 pt-32 relative overflow-hidden bg-transparent"
    >
      {/* ── Infinite Background Marquee ──────────────────────────────────── */}
      <div ref={marqueeRef} aria-hidden="true"
        className="absolute inset-0 flex items-center pointer-events-none overflow-hidden select-none"
        style={{ opacity: 0 }}>
        <div ref={marqueeInnerRef} className="flex whitespace-nowrap will-change-transform" style={{ width: "200%" }}>
          {[0, 1].map(k => (
            <span key={k}
              className="badge-font font-black uppercase italic text-white/[0.028] tracking-[0.05em] flex-shrink-0"
              style={{ fontSize: "clamp(4rem, 10vw, 9rem)" }}>
              {" "}// OPEN FOR COLLABORATION // SYSTEMS INITIALIZED // AVAILABLE NOW //{" "}
            </span>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">

        {/* HUD Badge */}
        <div ref={badgeRef}
          className="mb-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md"
          style={{ opacity: 0 }}>
          <Terminal size={13} />
          {t.contact.tag}
        </div>

        {/* ── Two-column grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── LEFT: Email + Social ─────────────────────────────────────── */}
          <div className="lg:col-span-5 relative z-10">
            <h2 ref={titleRef}
              className="badge-font font-black tracking-tighter text-white leading-[0.92] mb-6"
              style={{ fontSize: "clamp(2.6rem, 6.5vw, 5rem)", opacity: 0 }}>
              {heroT.letsTalk}
            </h2>

            <p ref={subtitleRef}
              className="text-white/40 font-light leading-relaxed mb-12 max-w-sm"
              style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", opacity: 0 }}>
              {language === "en"
                ? "I'm always open to discussing new projects, creative ideas, or being part of your visions."
                : "Siempre estoy dispuesto a discutir nuevos proyectos, ideas creativas o formar parte de tus visiones."}
            </p>

            {/* Giant Magnetic Email */}
            <MagneticWrap radius={120} strength={0.15} className="block mb-12">
              <button
                ref={emailBtnRef}
                onClick={handleCopyEmail}
                aria-label="Copy email address to clipboard"
                className="no-cursor-snap group relative text-left w-fit block"
                style={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[var(--primary)]/40 text-xs font-mono tracking-widest badge-font">CONTACT://</span>
                  <span className="text-white/20 text-[10px] badge-font uppercase tracking-[0.2em]">click to copy</span>
                </div>
                <div className="relative flex items-baseline gap-3">
                  <span ref={emailRef} data-final-text={EMAIL}
                    className="block font-bold text-white group-hover:text-[var(--primary)] transition-colors duration-300 font-mono tracking-tight"
                    style={{ fontSize: "clamp(1rem, 2.5vw, 2rem)" }}>
                    {EMAIL}
                  </span>
                  <div ref={cursorLineRef}
                    className="self-stretch w-[2px] bg-[var(--primary)] rounded-full flex-shrink-0"
                    style={{ minHeight: "1em" }} />
                </div>
                <div className="mt-3 h-px w-full bg-white/10 group-hover:bg-[var(--primary)]/40 transition-colors duration-500" />
              </button>
            </MagneticWrap>

            {/* Social links */}
            <div ref={socialsRef} className="flex items-center gap-10">
              <SocialLink href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
              <div className="w-px h-5 bg-white/10 flex-shrink-0" />
              <SocialLink href="https://github.com"   icon={Github}   label="GitHub"   />
              <div className="w-px h-5 bg-white/10 flex-shrink-0" />
              <SocialLink href={`mailto:${EMAIL}`}    icon={Mail}     label="Email"    />
            </div>

            {/* System status */}
            <div className="mt-16 flex items-center gap-3 text-white/15 text-[10px] font-mono tracking-[0.18em] uppercase">
              <span className="w-6 h-px bg-white/15" />
              <span>SYS v1.0.0 — ALL SYSTEMS NOMINAL</span>
            </div>
          </div>

          {/* ── RIGHT: Native Mail Compose Window ────────────────────────── */}
          <div ref={formColRef} className="lg:col-span-7" style={{ opacity: 0 }}>
            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col bg-[#161b22]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden h-[500px]"
            >
              {/* Header bar (macOS dots) */}
              <div className="flex items-center px-4 h-12 border-b border-white/10 bg-white/[0.02]">
                <div className="flex gap-2 w-20">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm font-medium text-white/80">New Message</span>
                </div>
                <div className="w-20" /> {/* Spacer for centering */}
              </div>

              {/* The Routing Fields */}
              <div className="flex flex-col bg-transparent">
                {/* Static To */}
                <div className="flex items-center gap-4 px-6 min-h-[44px] border-b border-white/5 disabled select-none">
                  <span className="text-sm text-white/40 w-16 flex-shrink-0">To:</span>
                  <span className="text-sm text-white/60">{EMAIL}</span>
                </div>

                <MailField
                  label="From:"
                  type="email"
                  value={fromEmail}
                  onChange={setFromEmail}
                />
                
                <MailField
                  label="Subject:"
                  value={subject}
                  onChange={setSubject}
                />
              </div>

              {/* Body Textarea */}
              <div className="flex-1 relative group p-6">
                <textarea
                  className="no-cursor-snap w-full h-full bg-transparent outline-none text-white text-sm resize-none placeholder:text-white/20"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Footer + Send Button */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                <button
                  type="submit"
                  disabled={!fromEmail || !message || submitState !== "idle"}
                  className="no-cursor-snap relative flex items-center justify-center gap-2 px-6 h-10 rounded-full bg-[var(--primary)] text-black font-semibold text-sm hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all overflow-hidden min-w-[120px]"
                >
                  {submitState === "idle" && (
                    <>
                      <span className="relative z-10">Send</span>
                      <Send ref={planeIconRef} size={15} className="relative z-10 ml-1" />
                    </>
                  )}
                  
                  {submitState === "sending" && (
                    <Loader2 size={16} className="animate-spin text-black" />
                  )}
                  
                  {submitState === "success" && (
                    <>
                      <Check size={16} className="text-black" />
                      <span>Sent!</span>
                    </>
                  )}
                  
                  {submitState === "error" && (
                    <span>Retry</span>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
};
