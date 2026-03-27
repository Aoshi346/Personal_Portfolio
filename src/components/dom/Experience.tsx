import { Briefcase } from "lucide-react";
import { Language, translations } from "../../constants/translations";

export const Experience = ({ language }: { language: Language }) => {
  const t = translations[language].sections;

  return (
    <section
      id="section-2"
      className="min-h-screen py-32 px-12 md:px-24 relative overflow-hidden flex items-center bg-transparent"
    >
      <div className="reveal-content w-full max-w-7xl mx-auto relative z-10">
        <div className="stagger-item mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase badge-font backdrop-blur-md">
          <Briefcase size={14} /> {t.experience.tag}
        </div>
        <h2 className="stagger-item text-5xl md:text-7xl font-bold text-white mb-16 tracking-tighter badge-font">
          <div className="overflow-hidden">
            <span className="block reveal-text uppercase italic">
              {t.experience.title}
            </span>
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
  );
};
