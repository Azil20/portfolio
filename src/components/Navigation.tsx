import { useEffect, useState } from 'react';
import { Moon, Sun, Menu, X, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navigation() {
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const sections = ['experiences', 'projects', 'skills', 'faq', 'reach-out'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('nav.experiences'), href: '#experiences', id: 'experiences' },
    { label: t('nav.projects'), href: '#projects', id: 'projects' },
    { label: t('nav.skills'), href: '#skills', id: 'skills' },
    { label: t('nav.faq'), href: '#faq', id: 'faq' },
    { label: t('nav.contact'), href: '#reach-out', id: 'reach-out' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="nav-header">
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
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button 
          onClick={toggleLanguage} 
          className="theme-toggle lang-toggle" 
          aria-label="Toggle Language" 
          title={currentLang === 'en' ? 'Passer en Français' : 'Switch to English'}
          style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Languages size={15} />
          <span>{currentLang === 'en' ? 'FR' : 'EN'}</span>
        </button>
      </div>

      <button 
        className="mobile-nav-toggle" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </nav>
  );
}
