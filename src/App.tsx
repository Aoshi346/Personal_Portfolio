import { useEffect, useState, useCallback } from 'react'
import { ReactLenis } from 'lenis/react'
import Sections from './components/dom/Sections'
import Preloader from './components/dom/Preloader'
import CustomCursor from './components/dom/CustomCursor'
import { Language } from './constants/translations'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [lang, setLang] = useState<Language>('en')

  const handleLoaded = useCallback(() => {
    setLoaded(true)
  }, [])

  // Start loading sequence or handle data if needed
  useEffect(() => {
    if (loaded) {
      // Any logic that needs to run after loading completes
    }
  }, [loaded]);

  // Sync HTML lang attribute for SEO and Accessibility
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'es' : 'en')
  }

  return (
    <>
      {!loaded && <Preloader onComplete={handleLoaded} language={lang} />}
      <CustomCursor />
      
      {/* Floating Language Toggle */}
      <button
        onClick={toggleLang}
        aria-label={lang === 'en' ? "Switch to Spanish" : "Cambiar a Inglés"}
        title={lang === 'en' ? "Switch to Spanish" : "Cambiar a Inglés"}
        className={`fixed top-8 right-8 z-[90] flex items-center gap-4 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-20 transition-all duration-500 group overflow-hidden ${
          !loaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* US Flag Icon */}
          <div className={`relative w-5 h-5 rounded-full overflow-hidden border transition-all duration-500 ${lang === 'en' ? 'border-[var(--primary)] scale-110 shadow-[0_0_10px_rgba(143,245,255,0.3)]' : 'border-white/10 opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="100" fill="#B22234"/>
              <rect width="100" height="7.69" y="15.38" fill="#fff"/>
              <rect width="100" height="7.69" y="30.76" fill="#fff"/>
              <rect width="100" height="7.69" y="46.15" fill="#fff"/>
              <rect width="100" height="7.69" y="61.53" fill="#fff"/>
              <rect width="100" height="7.69" y="76.92" fill="#fff"/>
              <rect width="100" height="7.69" y="92.3" fill="#fff"/>
              <rect width="45" height="53.85" fill="#3C3B6E"/>
              <circle cx="10" cy="10" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="20" cy="10" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="30" cy="10" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="15" cy="20" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="25" cy="20" r="1.5" fill="#fff" opacity="0.8"/>
              <circle cx="35" cy="20" r="1.5" fill="#fff" opacity="0.8"/>
            </svg>
          </div>

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Spain Flag Icon */}
          <div className={`relative w-5 h-5 rounded-full overflow-hidden border transition-all duration-500 ${lang === 'es' ? 'border-[var(--primary)] scale-110 shadow-[0_0_10px_rgba(143,245,255,0.3)]' : 'border-white/10 opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect width="100" height="25" fill="#AD1519"/>
              <rect width="100" height="50" y="25" fill="#FABD00"/>
              <rect width="100" height="25" y="75" fill="#AD1519"/>
              {/* Simplified Coat of Arms circle */}
              <circle cx="25" cy="50" r="8" fill="#AD1519" opacity="0.6" />
            </svg>
          </div>
        </div>
        
        {/* Subtle sliding background indicator for active language */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
        <main 
          role="main"
          className={`relative w-full overflow-hidden transition-all duration-800 ease-out z-10 ${
            loaded 
              ? 'opacity-100 blur-0 scale-100' 
              : 'opacity-0 blur-2xl scale-110 h-screen overflow-hidden'
          }`}
        >
          <div className="relative z-10">
            <Sections language={lang} loaded={loaded} />
          </div>
        </main>
      </ReactLenis>
    </>
  )
}

export default App
