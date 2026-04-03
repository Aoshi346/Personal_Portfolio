import { useEffect, useState, useCallback } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import Sections from './components/dom/Sections'
import Preloader from './components/dom/Preloader'
import CustomCursor from './components/dom/CustomCursor'
import SceneBackground from './components/r3f/SceneBackground'
import { Language } from './constants/translations'

// ── Scroll Manager ──────────────────────────────────────────────────────────
// Handles initial scroll-top, scroll-restoration, and locking during preloading.
// Must be a child of ReactLenis to access the useLenis hook.
function ScrollManager({ loaded }: { loaded: boolean }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // 1. Force manual scroll restoration to prevent browser from jumping
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Force scroll to top on first mount
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    // 3. Lock/Unlock scroll based on loading state
    if (!loaded) lenis.stop();
    else lenis.start();

  }, [lenis, loaded]);

  return null;
}

function App() {
  const [loaded, setLoaded]       = useState(false)
  // heroReady fires at 80% of the preloader exit so Hero can start early
  const [heroReady, setHeroReady] = useState(false)
  const [lang, setLang]           = useState<Language>('en')

  const handleHeroStart = useCallback(() => setHeroReady(true),  [])
  const handleLoaded    = useCallback(() => setLoaded(true),      [])

  // Sync HTML lang attribute for SEO / a11y
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggleLang = () => setLang(prev => prev === 'en' ? 'es' : 'en')

  return (
    <>
      <SceneBackground />

      {/* Preloader stays in DOM until onComplete, fires onHeroStart at 80 % */}
      {!loaded && (
        <Preloader
          onComplete={handleLoaded}
          onHeroStart={handleHeroStart}
          language={lang}
        />
      )}

      <CustomCursor />

      {/* Language Toggle — hidden while loading */}
      <button
        onClick={toggleLang}
        aria-label={lang === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
        title={lang === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
        className={`fixed top-8 right-8 z-[90] flex items-center gap-4 px-4 py-2.5 rounded-full
          bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10
          transition-all duration-500 group overflow-hidden
          ${!loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-3">
          {/* US Flag */}
          <div className={`relative w-5 h-5 rounded-full overflow-hidden border transition-all duration-500
            ${lang === 'en'
              ? 'border-[var(--primary)] scale-110 shadow-[0_0_10px_rgba(143,245,255,0.3)]'
              : 'border-white/10 opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" fill="#B22234"/>
              <rect width="100" height="7.69" y="15.38" fill="#fff"/>
              <rect width="100" height="7.69" y="30.76" fill="#fff"/>
              <rect width="100" height="7.69" y="46.15" fill="#fff"/>
              <rect width="100" height="7.69" y="61.53" fill="#fff"/>
              <rect width="100" height="7.69" y="76.92" fill="#fff"/>
              <rect width="100" height="7.69" y="92.3"  fill="#fff"/>
              <rect width="45"  height="53.85"          fill="#3C3B6E"/>
              <circle cx="10" cy="10" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="20" cy="10" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="30" cy="10" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="15" cy="20" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="25" cy="20" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="35" cy="20" r="1.5" fill="#fff" opacity="0.8"/>
            </svg>
          </div>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Spain Flag */}
          <div className={`relative w-5 h-5 rounded-full overflow-hidden border transition-all duration-500
            ${lang === 'es'
              ? 'border-[var(--primary)] scale-110 shadow-[0_0_10px_rgba(143,245,255,0.3)]'
              : 'border-white/10 opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="25"           fill="#AD1519"/>
              <rect width="100" height="50" y="25"    fill="#FABD00"/>
              <rect width="100" height="25" y="75"    fill="#AD1519"/>
              <circle cx="25"  cy="50"     r="8"      fill="#AD1519" opacity="0.6"/>
            </svg>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Main content — never blurred/scaled by CSS; Hero handles its own entrance */}
      <ReactLenis
        root
        options={{
          lerp:         0.05,     // "Weighted" feel — cinematic momentum
          duration:     1.8,      // Full easing duration
          smoothWheel:  true,
          syncTouch:    false,    // Don't override native iOS momentum
          infinite:     false,
          // raf handled by Lenis internally; works correctly at 120Hz because
          // Lenis uses requestAnimationFrame which matches display refresh rate
        }}
      >
        {/* Forces scroll-top, manual restoration, and preload-stop */}
        <ScrollManager loaded={loaded} />

        <main
          role="main"
          className="relative w-full overflow-hidden z-10"
          aria-hidden={!heroReady}
        >
          {/* Global edge vignette — focuses eye on center content */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[50]"
            style={{
              background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(11,14,20,0.55) 100%)`,
            }}
          />
          <div className="relative z-10">
            <Sections language={lang} loaded={loaded} heroReady={heroReady} />
          </div>
        </main>
      </ReactLenis>
    </>
  )
}

export default App
