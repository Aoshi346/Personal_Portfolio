import { ChevronRight, Github, Linkedin } from "lucide-react";
import { Language, translations } from "../../constants/translations";

export const Hero = ({ language }: { language: Language }) => {
  const t = translations[language].hero;

  return (
    <section
      id="section-1"
      className="h-screen flex items-center justify-start px-12 md:px-24 relative overflow-hidden bg-transparent"
    >
      <div className="reveal-content max-w-2xl relative z-10">
        <h1 className="stagger-item text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary)] badge-font mb-4">
          <div className="overflow-hidden">
            <span className="block reveal-text uppercase italic">Aoshi Blanco</span>
          </div>
        </h1>
        <h2 className="stagger-item text-[clamp(2.2rem,6.4vw,4.8rem)] md:text-[clamp(2.9rem,7.5vw,5.75rem)] font-black tracking-tighter text-white leading-[1] badge-font mb-8 max-w-[min(90vw,18ch)] md:max-w-[min(90vw,22ch)]">
          <div className="overflow-hidden">
            <span className="block reveal-text text-[inherit] md:text-[inherit] whitespace-nowrap">
              {t.role.split(" ")[0]}
            </span>
          </div>
          <div className="overflow-hidden">
            <span className="block reveal-text outline-text text-[inherit] md:text-[inherit] whitespace-nowrap">
              {t.role.split(" ").slice(1).join(" ")}
            </span>
          </div>
        </h2>
        <p className="stagger-item text-xl md:text-2xl text-white/50 mt-4 font-light leading-relaxed">
          {t.bio}
        </p>
        <div className="stagger-item mt-12 flex items-center gap-6">
          <button
            onClick={() =>
              document
                .getElementById("section-4")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="hero-cta px-8 py-4 bg-white text-[#0b0e14] font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 group shadow-2xl"
          >
            {t.viewWork}{" "}
            <ChevronRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <div className="flex gap-4 text-white/40">
            <a
              href="https://github.com"
              aria-label="GitHub Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github
                size={20}
                className="hover:text-white cursor-pointer transition-colors"
              />
            </a>
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn Profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin
                size={20}
                className="hover:text-white cursor-pointer transition-colors"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
