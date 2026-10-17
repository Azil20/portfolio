import { useEffect, useState, useRef } from 'react';
import { Moon, Sun, Menu, X, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OptionWheel from './OptionWheel';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export default function Navigation() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [activeSection, setActiveSection] = useState('experiences');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showWheel, setShowWheel] = useState(false);
  const lastScrollY = useRef(0);
  const scrollStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringWheelRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {}
  };

  // Automatically sync with device system theme if user has not manually overridden
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDeviceThemeChange = (e: MediaQueryListEvent) => {
      try {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleDeviceThemeChange);
    return () => mediaQuery.removeEventListener('change', handleDeviceThemeChange);
  }, []);

  useEffect(() => {
    const sections = ['experiences', 'projects', 'skills', 'faq', 'reach-out'];
    
    const handleScroll = () => {
      if (mobileMenuOpen) return;

      const currentScrollY = window.scrollY;

      // Update active section only when not in programmatic navigation
      if (!isNavigatingRef.current) {
        const scrollPosition = currentScrollY + 200;
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }

      // Hide header on slide down, show on slide up or at top
      if (currentScrollY <= 60) {
        setHeaderVisible(true);
        setShowWheel(false);
        if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
      } else {
        const delta = currentScrollY - lastScrollY.current;

        // User is scrolling -> show wheel
        setShowWheel(true);

        if (delta > 6 && currentScrollY > 80) {
          setHeaderVisible(false);
        } else if (delta < -10) {
          setHeaderVisible(true);
        }

        // Auto-hide wheel when user stops scrolling
        if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
        scrollStopTimerRef.current = setTimeout(() => {
          if (!isHoveringWheelRef.current && !isNavigatingRef.current) {
            setShowWheel(false);
          }
        }, 1300);
      }

      lastScrollY.current = currentScrollY;
    };

    let scrollRafId = 0;
    const onScroll = () => {
      if (scrollRafId) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = 0;
        handleScroll();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: t('nav.experiences'), href: '#experiences', id: 'experiences' },
    { label: t('nav.projects'), href: '#projects', id: 'projects' },
    { label: t('nav.skills'), href: '#skills', id: 'skills' },
    { label: t('nav.faq'), href: '#faq', id: 'faq' },
    { label: t('nav.contact'), href: '#reach-out', id: 'reach-out' },
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeSection);
  const selectedWheelIndex = activeIndex >= 0 ? activeIndex : 0;

  const scrollToSectionTarget = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      isNavigatingRef.current = true;
      setHeaderVisible(false);
      
      const topOffset = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });

      if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
      scrollStopTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
        if (!isHoveringWheelRef.current) {
          setShowWheel(false);
        }
      }, 850);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    scrollToSectionTarget(targetId);
    setMobileMenuOpen(false);
  };

  const handleWheelChange = (index: number) => {
    const targetItem = navItems[index];
    if (targetItem) {
      setActiveSection(targetItem.id);
      scrollToSectionTarget(targetItem.id);
    }
  };

  return (
    <>
      <nav className={`nav-header ${headerVisible ? '' : 'header-hidden'}`}>
      <a 
        href="#top" 
        className="nav-logo" 
        onClick={(e) => { 
          e.preventDefault(); 
          window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }}
      >
        MOHAMED AZIL
      </a>
      
      <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
          >
            {item.label}
          </a>
        ))}
        <button onClick={toggleTheme} className="theme-toggle cursor-target" data-cursor-label="Theme" aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        {/* Language Option Switcher: EN / FR segmented pill */}
        <div className="lang-switcher-pill" role="group" aria-label="Language selection">
          <Languages size={14} className="lang-icon" />
          <button
            type="button"
            className={`lang-pill-btn ${currentLang === 'en' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('en')}
            aria-pressed={currentLang === 'en'}
            title="English"
          >
            EN
          </button>
          <span className="lang-pill-divider">·</span>
          <button
            type="button"
            className={`lang-pill-btn ${currentLang === 'fr' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('fr')}
            aria-pressed={currentLang === 'fr'}
            title="Français"
          >
            FR
          </button>
        </div>
      </div>

      <div className="mobile-nav-controls">
        <button onClick={toggleTheme} className="theme-toggle cursor-target" data-cursor-label="Theme" aria-label="Toggle Theme" title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="lang-switcher-pill" role="group" aria-label="Language selection">
          <button
            type="button"
            className={`lang-pill-btn ${currentLang === 'en' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('en')}
            aria-pressed={currentLang === 'en'}
          >
            EN
          </button>
          <span className="lang-pill-divider">·</span>
          <button
            type="button"
            className={`lang-pill-btn ${currentLang === 'fr' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('fr')}
            aria-pressed={currentLang === 'fr'}
          >
            FR
          </button>
        </div>
        <button 
          className="mobile-nav-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>

    {/* Floating side navigation wheel (shown on scroll down) */}
    <div 
      className={`floating-wheel-nav ${showWheel ? 'visible' : ''}`}
      aria-hidden={!showWheel}
      onMouseEnter={() => {
        isHoveringWheelRef.current = true;
        setShowWheel(true);
        if (scrollStopTimerRef.current) clearTimeout(scrollStopTimerRef.current);
      }}
      onMouseLeave={() => {
        isHoveringWheelRef.current = false;
        scrollStopTimerRef.current = setTimeout(() => {
          setShowWheel(false);
        }, 1300);
      }}
    >
      <OptionWheel
        items={navItems.map(item => item.label)}
        selected={selectedWheelIndex}
        disabled={!showWheel}
        tabIndex={showWheel ? 0 : -1}
        side="right"
        fontSize={1.05}
        spacing={1.4}
        curve={0.5}
        tilt={4}
        blur={0}
        fade={0.18}
        minOpacity={0.35}
        smoothing={180}
        inset={24}
        loop={false}
        draggable={true}
        textColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.45)'}
        activeColor={theme === 'dark' ? '#ffffff' : '#0a0a0a'}
        onChange={(index) => handleWheelChange(index)}
      />
    </div>
  </>
);
}
