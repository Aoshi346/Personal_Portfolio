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

export const Projects = ({ language }: { language: Language }) => {
  const t = translations[language].sections;
  const heroT = translations[language].hero;

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
  ];

  return (
    <section
      id="section-4"
      className="min-h-screen py-32 px-12 md:px-24 relative overflow-hidden flex items-center bg-transparent"
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
          {projects.map((project, i) => (
            <div
              key={i}
              className="stagger-item group relative p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Ghost Border SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="24"
                  ry="24"
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
                    <ExternalLink
                      size={24}
                      className="text-white/20 group-hover:text-white transition-colors"
                    />
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
                    <Icon
                      size={16}
                      className="text-[var(--primary)]/50 group-hover:text-[var(--primary)] transition-colors"
                    />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("section-5")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="relative z-10 whitespace-nowrap px-8 py-5 bg-gradient-to-br from-[var(--secondary)] to-[var(--tertiary)] text-black text-lg font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-lg shadow-[var(--secondary)]/10"
            >
              {heroT.letsTalk}{" "}
              <ChevronRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
