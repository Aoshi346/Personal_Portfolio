import { useState } from "react";
import { Cpu } from "lucide-react";
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

export const Skills = ({ language }: { language: Language }) => {
  const t = translations[language].sections;
  const [hoveredSkill, setHoveredSkill] = useState<{
    name: string;
    icon: any;
    desc: string;
  } | null>(null);

  const desktopPreviewSkill = hoveredSkill ?? {
    ...SKILLS[0],
    desc:
      t.skillDescriptions[SKILLS[0].name as keyof typeof t.skillDescriptions] ||
      "",
  };

  return (
    <section
      id="section-3"
      className="min-h-screen py-24 px-12 md:px-24 relative overflow-hidden flex items-center bg-transparent"
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
              const skillDesc =
                t.skillDescriptions[
                  skill.name as keyof typeof t.skillDescriptions
                ] || "";
              return (
                <div
                  key={skill.name}
                  onMouseEnter={() =>
                    setHoveredSkill({ ...skill, desc: skillDesc })
                  }
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
  );
};
