import { useState } from "react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Language, translations } from "../../constants/translations";
import { MagneticButton } from "./MagneticButton";

export const Contact = ({ language }: { language: Language }) => {
  const t = translations[language].sections;
  const heroT = translations[language].hero;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("aoshi_blanco@outlook.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="section-5"
      className="min-h-screen flex items-center justify-start px-12 md:px-24 pb-48 relative overflow-hidden bg-transparent"
    >
      <div className="reveal-content max-w-xl relative z-10">
        <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--tertiary)]/10 border border-[var(--tertiary)]/20 text-[var(--tertiary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
          <Mail size={14} /> {t.contact.tag}
        </div>
        <h2 className="stagger-item text-4xl md:text-6xl font-bold text-white mb-8">
          {heroT.letsTalk}
        </h2>
        <p className="stagger-item text-white/40 text-xl font-light mb-12 leading-relaxed">
          I'm always open to discussing new projects, creative ideas, or being
          part of your visions.
        </p>
        <div className="stagger-item flex flex-col gap-8">
          <button
            onClick={handleCopyEmail}
            aria-label={
              copied ? t.contact.copied : "Copy email address to clipboard"
            }
            className="group text-left text-4xl md:text-5xl font-bold text-white transition-all pb-4 inline-block w-fit relative"
          >
            <span
              className={`block transition-all duration-500 ${
                copied ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              aoshi_blanco@outlook.com
            </span>
            <span
              className={`absolute left-0 top-0 text-[var(--primary)] block transition-all duration-500 ${
                copied
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
            >
              {t.contact.copied} ✓
            </span>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 group-hover:bg-white/40 transition-colors" />
          </button>

          <div className="flex gap-12 text-white/40 font-medium tracking-wide mt-4">
            <MagneticButton href="#" aria-label="LinkedIn Profile">
              <Linkedin
                size={20}
                className="text-white/30 group-hover:text-white transition-all"
                aria-hidden="true"
              />
              <span className="group-hover:text-white transition-all">
                LINKEDIN
              </span>
            </MagneticButton>
            <MagneticButton href="#" aria-label="GitHub Profile">
              <Github
                size={20}
                className="text-white/30 group-hover:text-white transition-all"
                aria-hidden="true"
              />
              <span className="group-hover:text-white transition-all">
                GITHUB
              </span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
};
