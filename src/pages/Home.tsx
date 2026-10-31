import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowDown, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  Mail, 
  Check, 
  Copy, 
  ChevronDown, 
  ArrowUpRight, 
  BookOpen, 
  Award, 
  Phone,
  X,
  Cpu,
  Layers,
  Loader2,
  AlertCircle,
  Download,
  Send,
  Calendar
} from 'lucide-react';
import Footer from '../components/Footer';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ArchitectureStep {
  title: string;
  desc: string;
}

interface ArchitecturePillar {
  label: string;
  val: string;
  desc: string;
}

interface ProjectItem {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  tags: string[];
  highlights: string;
  archOverview: string;
  steps: ArchitectureStep[];
  pillars: ArchitecturePillar[];
  featured?: boolean;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic age calculation based on birth date: June 10, 2004 (10/06/2004)
  const userAge = (() => {
    const today = new Date();
    let age = today.getFullYear() - 2004;
    const m = today.getMonth() - 5; // Month is 0-indexed (5 = June)
    if (m < 0 || (m === 0 && today.getDate() < 10)) {
      age--;
    }
    return age;
  })();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Active Project Architecture Modal
  const [activeArchProject, setActiveArchProject] = useState<ProjectItem | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveArchProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // FAQ Accordion State (all closed by default for clean scan)
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Contact Form State
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formErrorMsg, setFormErrorMsg] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('ailmohamed@outlook.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) return;

    setFormStatus('sending');
    setFormErrorMsg('');

    try {
      const accessKey = ((import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY || '').trim();

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formState.name.trim(),
          email: formState.email.trim(),
          subject: formState.subject.trim() || `Nouveau message de ${formState.name} (Portfolio Mohamed Azil)`,
          message: formState.message.trim(),
          from_name: formState.name.trim(),
          to_email: 'ailmohamed@outlook.com',
          botcheck: ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setFormStatus('success');
        setFormState({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setFormStatus('idle'), 6000);
      } else {
        setFormStatus('error');
        setFormErrorMsg(data.message || t('contact.sentError'));
        setTimeout(() => setFormStatus('idle'), 7000);
      }
    } catch {
      setFormStatus('error');
      setFormErrorMsg(t('contact.sentError'));
      setTimeout(() => setFormStatus('idle'), 7000);
    }
  };



  const [timelineFilter, setTimelineFilter] = useState<'all' | 'education' | 'internship'>('all');

  const journeyItems = [
    {
      id: 'm2',
      category: 'education',
      categoryLabel: t('journey.items.m2.categoryLabel'),
      period: t('journey.items.m2.period'),
      role: t('journey.items.m2.role'),
      institution: t('journey.items.m2.institution'),
      icon: <GraduationCap size={20} />,
      description: t('journey.items.m2.description'),
      skills: ['Deep Learning', 'Machine Learning', 'NLP', 'Transformers', 'Hadoop & Spark', 'PyTorch', 'Scikit-Learn', t('journey.items.m2.pfeSkill')]
    },
    {
      id: 'abhoer',
      category: 'internship',
      categoryLabel: t('journey.items.abhoer.categoryLabel'),
      period: t('journey.items.abhoer.period'),
      role: t('journey.items.abhoer.role'),
      institution: t('journey.items.abhoer.institution'),
      icon: <Briefcase size={20} />,
      description: t('journey.items.abhoer.description'),
      skills: ['Windows Server 2012', 'Active Directory', 'DNS / DHCP', 'VPN', t('journey.items.abhoer.skillMaintenance'), t('journey.items.abhoer.skillSecurity')]
    },
    {
      id: 'licence',
      category: 'education',
      categoryLabel: t('journey.items.licence.categoryLabel'),
      period: t('journey.items.licence.period'),
      role: t('journey.items.licence.role'),
      institution: t('journey.items.licence.institution'),
      icon: <BookOpen size={20} />,
      description: t('journey.items.licence.description'),
      skills: [t('journey.items.licence.skillAlgo'), t('journey.items.licence.skillSys'), 'C++', 'Java', t('journey.items.licence.skillDb'), t('journey.items.licence.skillRo')]
    },
    {
      id: 'onssa',
      category: 'internship',
      categoryLabel: t('journey.items.onssa.categoryLabel'),
      period: t('journey.items.onssa.period'),
      role: t('journey.items.onssa.role'),
      institution: t('journey.items.onssa.institution'),
      icon: <Briefcase size={20} />,
      description: t('journey.items.onssa.description'),
      skills: [t('journey.items.onssa.skillData'), t('journey.items.onssa.skillExcel'), t('journey.items.onssa.skillSupport'), t('journey.items.onssa.skillMaint')]
    },
    {
      id: 'bts',
      category: 'education',
      categoryLabel: t('journey.items.bts.categoryLabel'),
      period: t('journey.items.bts.period'),
      role: t('journey.items.bts.role'),
      institution: t('journey.items.bts.institution'),
      icon: <Award size={20} />,
      description: t('journey.items.bts.description'),
      skills: [t('journey.items.bts.skillSysNet'), 'Linux / Windows Server', t('journey.items.bts.skillProtocols'), t('journey.items.bts.skillTelecom'), t('journey.items.bts.skillSec')]
    }
  ];

  const educationCount = journeyItems.filter(item => item.category === 'education').length;
  const internshipCount = journeyItems.filter(item => item.category === 'internship').length;
  const filteredJourney = timelineFilter === 'all' 
    ? journeyItems 
    : journeyItems.filter(item => item.category === timelineFilter);

  const projects: ProjectItem[] = [
    {
      id: 'bma',
      featured: true,
      title: t('projects.items.bma.title'),
      badge: t('projects.items.bma.badge', 'NLP & Generative AI'),
      subtitle: 'PyTorch, DistilBERT, Gemini API, Flask, SQLite',
      description: t('projects.items.bma.description'),
      tags: ['PyTorch', 'DistilBERT', 'Gemini API', 'Flask', 'SQLite', t('projects.items.bma.multilingualTag')],
      highlights: t('projects.items.bma.highlights'),
      archOverview: t('projects.items.bma.archOverview'),
      steps: [
        { title: t('projects.items.bma.steps.0.title'), desc: t('projects.items.bma.steps.0.desc') },
        { title: t('projects.items.bma.steps.1.title'), desc: t('projects.items.bma.steps.1.desc') },
        { title: t('projects.items.bma.steps.2.title'), desc: t('projects.items.bma.steps.2.desc') },
        { title: t('projects.items.bma.steps.3.title'), desc: t('projects.items.bma.steps.3.desc') },
        { title: t('projects.items.bma.steps.4.title'), desc: t('projects.items.bma.steps.4.desc') }
      ],
      pillars: [
        { label: t('projects.items.bma.pillars.0.label'), val: t('projects.items.bma.pillars.0.val'), desc: t('projects.items.bma.pillars.0.desc') },
        { label: t('projects.items.bma.pillars.1.label'), val: t('projects.items.bma.pillars.1.val'), desc: t('projects.items.bma.pillars.1.desc') },
        { label: t('projects.items.bma.pillars.2.label'), val: t('projects.items.bma.pillars.2.val'), desc: t('projects.items.bma.pillars.2.desc') },
        { label: t('projects.items.bma.pillars.3.label'), val: t('projects.items.bma.pillars.3.val'), desc: t('projects.items.bma.pillars.3.desc') }
      ]
    },
    {
      id: 'fraudguard',
      title: t('projects.items.fraudguard.title'),
      badge: t('projects.items.fraudguard.badge', 'Imbalanced ML • Production'),
      subtitle: 'Python, Scikit-Learn, SHAP, Imbalanced ML, Flask',
      description: t('projects.items.fraudguard.description'),
      tags: ['Python', 'Scikit-Learn', 'SHAP', 'Imbalanced ML', 'Flask', 'PR-AUC & ROC-AUC'],
      highlights: t('projects.items.fraudguard.highlights'),
      archOverview: t('projects.items.fraudguard.archOverview'),
      steps: [
        { title: t('projects.items.fraudguard.steps.0.title'), desc: t('projects.items.fraudguard.steps.0.desc') },
        { title: t('projects.items.fraudguard.steps.1.title'), desc: t('projects.items.fraudguard.steps.1.desc') },
        { title: t('projects.items.fraudguard.steps.2.title'), desc: t('projects.items.fraudguard.steps.2.desc') },
        { title: t('projects.items.fraudguard.steps.3.title'), desc: t('projects.items.fraudguard.steps.3.desc') },
        { title: t('projects.items.fraudguard.steps.4.title'), desc: t('projects.items.fraudguard.steps.4.desc') }
      ],
      pillars: [
        { label: t('projects.items.fraudguard.pillars.0.label'), val: t('projects.items.fraudguard.pillars.0.val'), desc: t('projects.items.fraudguard.pillars.0.desc') },
        { label: t('projects.items.fraudguard.pillars.1.label'), val: t('projects.items.fraudguard.pillars.1.val'), desc: t('projects.items.fraudguard.pillars.1.desc') },
        { label: t('projects.items.fraudguard.pillars.2.label'), val: t('projects.items.fraudguard.pillars.2.val'), desc: t('projects.items.fraudguard.pillars.2.desc') },
        { label: t('projects.items.fraudguard.pillars.3.label'), val: t('projects.items.fraudguard.pillars.3.val'), desc: t('projects.items.fraudguard.pillars.3.desc') }
      ]
    },
    {
      id: 'intelej',
      title: t('projects.items.intelej.title'),
      badge: t('projects.items.intelej.badge', 'Healthcare AI • Enterprise'),
      subtitle: 'React 18, TypeScript, Tailwind CSS, Supabase',
      description: t('projects.items.intelej.description'),
      tags: ['React 18', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Assistant Al-Rāzī', 'Triage Médical'],
      highlights: t('projects.items.intelej.highlights'),
      archOverview: t('projects.items.intelej.archOverview'),
      steps: [
        { title: t('projects.items.intelej.steps.0.title'), desc: t('projects.items.intelej.steps.0.desc') },
        { title: t('projects.items.intelej.steps.1.title'), desc: t('projects.items.intelej.steps.1.desc') },
        { title: t('projects.items.intelej.steps.2.title'), desc: t('projects.items.intelej.steps.2.desc') },
        { title: t('projects.items.intelej.steps.3.title'), desc: t('projects.items.intelej.steps.3.desc') },
        { title: t('projects.items.intelej.steps.4.title'), desc: t('projects.items.intelej.steps.4.desc') }
      ],
      pillars: [
        { label: t('projects.items.intelej.pillars.0.label'), val: t('projects.items.intelej.pillars.0.val'), desc: t('projects.items.intelej.pillars.0.desc') },
        { label: t('projects.items.intelej.pillars.1.label'), val: t('projects.items.intelej.pillars.1.val'), desc: t('projects.items.intelej.pillars.1.desc') },
        { label: t('projects.items.intelej.pillars.2.label'), val: t('projects.items.intelej.pillars.2.val'), desc: t('projects.items.intelej.pillars.2.desc') },
        { label: t('projects.items.intelej.pillars.3.label'), val: t('projects.items.intelej.pillars.3.val'), desc: t('projects.items.intelej.pillars.3.desc') }
      ]
    }
  ];

  const skillGroups = [
    {
      title: t('skills.groups.prog'),
      skills: ['Python', 'C++', 'Java', 'SQL', 'TypeScript', 'JavaScript', 'Bash', 'PHP']
    },
    {
      title: t('skills.groups.ai'),
      skills: ['PyTorch', 'Scikit-Learn', 'Deep Learning', 'Transformers', 'NLP', t('skills.groups.ai_shap'), t('skills.groups.ai_imbalanced'), t('skills.groups.ai_expert')]
    },
    {
      title: t('skills.groups.bigdata'),
      skills: ['Hadoop & Spark', t('skills.groups.bigdata_dist'), t('skills.groups.bigdata_parallel'), t('skills.groups.bigdata_storage'), t('skills.groups.bigdata_algo'), t('skills.groups.bigdata_ro')]
    },
    {
      title: t('skills.groups.se'),
      skills: ['FastAPI', 'Flask', 'React 18', 'REST APIs', 'Supabase', 'Tailwind CSS', t('skills.groups.se_sys')]
    },
    {
      title: t('skills.groups.db'),
      skills: [t('skills.groups.db_adv'), 'PostgreSQL', 'MySQL', 'SQLite', 'Supabase']
    },
    {
      title: t('skills.groups.tools_and_languages'),
      skills: ['Linux', 'Git', t('skills.groups.tools_problem'), t('skills.groups.tools_team'), t('skills.groups.lang_ar'), t('skills.groups.lang_fr'), t('skills.groups.lang_en')]
    }
  ];

  const faqs = [
    {
      question: t('faq.items.q1.question'),
      answer: t('faq.items.q1.answer')
    },
    {
      question: t('faq.items.q2.question'),
      answer: t('faq.items.q2.answer')
    },
    {
      question: t('faq.items.q3.question'),
      answer: t('faq.items.q3.answer')
    },
    {
      question: t('faq.items.q4.question'),
      answer: t('faq.items.q4.answer')
    },
    {
      question: t('faq.items.q5.question'),
      answer: t('faq.items.q5.answer')
    }
  ];

  return (
    <>


      <main id="top">
        {/* Hero Section */}
        <section className="hero-section" id="hero">
          <motion.div 
            style={{ y: isMobile ? 0 : y }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="container"
          >
            <div className="hero-status-pill">
              <span className="status-indicator-dot pulse"></span>
              <span>{t('hero.status')}</span>
            </div>
            
            <h1 className="display-title">
              Mohamed <br />
              <span className="chrome-text">Azil</span>
            </h1>

            <p className="text-muted hero-desc">
              {t('hero.description')}
            </p>

            <div className="hero-cta-group">
              <a href="#projects" className="btn cursor-target" data-cursor-label="Explore">
                {t('hero.explore')}
              </a>
              <a href="#reach-out" className="btn btn-outline cursor-target" data-cursor-label="Contact">
                {t('hero.contact')} <ArrowUpRight size={18} style={{ marginLeft: '6px' }} />
              </a>

              {/* CV Download Dropdown */}
              <div className="hero-cv-dropdown-wrapper">
                <button 
                  type="button" 
                  className="btn btn-outline hero-cv-btn cursor-target"
                  data-cursor-label="Resume"
                  onClick={() => setCvDropdownOpen(!cvDropdownOpen)}
                  aria-expanded={cvDropdownOpen}
                >
                  <Download size={16} />
                  <span>{isFrench ? "Télécharger CV" : "Download CV"}</span>
                  <ChevronDown size={14} style={{ transform: cvDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>
                {cvDropdownOpen && (
                  <div className="hero-cv-dropdown-menu">
                    <a 
                      href="/CV_Mohamed_Azil_EN.pdf" 
                      download="CV_Mohamed_AZIL_EN.pdf"
                      className="hero-cv-dropdown-item"
                      onClick={() => setCvDropdownOpen(false)}
                    >
                      <span className="cv-item-lang">EN</span>
                      <div className="cv-item-text">
                        <strong>English Resume</strong>
                        <small>PDF (Big Data &amp; AI)</small>
                      </div>
                      <Download size={14} />
                    </a>
                    <a 
                      href="/CV_Mohamed_Azil_FR.pdf" 
                      download="CV_Mohamed_AZIL_FR.pdf"
                      className="hero-cv-dropdown-item"
                      onClick={() => setCvDropdownOpen(false)}
                    >
                      <span className="cv-item-lang">FR</span>
                      <div className="cv-item-text">
                        <strong>CV Français</strong>
                        <small>PDF (Officiel M2)</small>
                      </div>
                      <Download size={14} />
                    </a>
                  </div>
                )}
              </div>

              <a href="mailto:ailmohamed@outlook.com" className="btn btn-outline hero-email-btn">
                <Mail size={16} /> ailmohamed@outlook.com
              </a>
            </div>
          </motion.div>

          <div style={{ position: 'absolute', bottom: '22px', left: '50%', transform: 'translateX(-50%)' }}>
            <motion.a
              href="#experiences"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              aria-label="Scroll down to Journey"
            >
              <ArrowDown size={28} className="text-muted scroll-down-arrow" aria-hidden="true" />
            </motion.a>
          </div>
        </section>

        {/* 1. Experiences Section */}
        <section className="section" id="experiences">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-eyebrow">{t('journey.eyebrow')}</span>
              <h2 className="section-title">{t('journey.title')}</h2>
              <p className="text-muted section-desc">
                {t('journey.description')}
              </p>
            </motion.div>

            {/* Filter Tabs */}
            <div className="timeline-filter-tabs">
              <button 
                type="button"
                className={`timeline-tab-btn ${timelineFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTimelineFilter('all')}
              >
                {t('journey.filters.all')} <span className="tab-count-pill">{journeyItems.length}</span>
              </button>
              <button 
                type="button"
                className={`timeline-tab-btn ${timelineFilter === 'education' ? 'active' : ''}`}
                onClick={() => setTimelineFilter('education')}
              >
                <GraduationCap size={16} /> {t('journey.filters.education')} ({educationCount})
              </button>
              <button 
                type="button"
                className={`timeline-tab-btn ${timelineFilter === 'internship' ? 'active' : ''}`}
                onClick={() => setTimelineFilter('internship')}
              >
                <Briefcase size={16} /> {t('journey.filters.internship')} ({internshipCount})
              </button>
            </div>

            <div className="timeline-container">
              <AnimatePresence mode="popLayout">
                {filteredJourney.map((item, idx) => (
                  <motion.div 
                    key={item.id} 
                    className="timeline-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    layout
                  >
                    <div className="timeline-marker">
                      <div className="timeline-icon-wrap">
                        {item.icon}
                      </div>
                      {idx < filteredJourney.length - 1 && <div className="timeline-line"></div>}
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className={`timeline-category-badge category-${item.category}`}>
                          {item.categoryLabel}
                        </span>
                        <span className="timeline-period">{item.period}</span>
                        <span className="timeline-institution">{item.institution}</span>
                      </div>
                      <h3 className="timeline-role">{item.role}</h3>
                      <p className="text-muted timeline-desc">{item.description}</p>
                      <div className="tag-cluster">
                        {item.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="tech-badge">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 2. Projects Section */}
        <section className="section" id="projects" style={{ background: 'var(--accent-color)' }}>
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-eyebrow">{t('projects.eyebrow')}</span>
              <h2 className="section-title">{t('projects.title')}</h2>
              <p className="text-muted section-desc">
                {t('projects.description')}
              </p>
            </motion.div>

            <div className="projects-grid">
              {projects.map((proj, idx) => (
                <motion.div 
                  key={proj.id} 
                  className={`project-card ${proj.featured ? 'featured' : ''}`}
                  initial={{ opacity: 0, y: 32, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.52, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveArchProject(proj)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveArchProject(proj);
                    }
                  }}
                  title={t('projects.view_architecture')}
                >
                  <div className="project-header">
                    <div className="project-badges-group">
                      <span className="project-badge">{proj.badge}</span>
                      {proj.featured && (
                        <span className="project-flagship-badge">
                          ⭐ {isFrench ? 'Projet Phare' : 'Flagship'}
                        </span>
                      )}
                    </div>
                    <span className="project-index">0{idx + 1}</span>
                  </div>

                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-subtitle text-muted">{proj.subtitle}</p>
                  <p className="project-description">{proj.description}</p>

                  <div className="project-highlights">
                    <Sparkles size={16} className="text-muted" style={{ flexShrink: 0 }} />
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>{proj.highlights}</span>
                  </div>

                  <div className="tag-cluster" style={{ marginTop: '1.25rem' }}>
                    {proj.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="tech-badge">{tag}</span>
                    ))}
                  </div>

                  {/* Visual trigger indicating architecture can be opened */}
                  <div className="project-arch-cta">
                    <Cpu size={16} />
                    <span>{t('projects.view_architecture')}</span>
                    <ArrowUpRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Skills & Compétences Section */}
        <section className="section" id="skills">
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-eyebrow">{t('skills.eyebrow')}</span>
              <h2 className="section-title">{t('skills.title')}</h2>
              <p className="text-muted section-desc">
                {t('skills.description')}
              </p>
            </motion.div>

            <div className="skills-grid">
              {skillGroups.map((group, idx) => (
                <motion.div 
                  key={idx} 
                  className="skill-category-card"
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.48, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="skill-group-title">{group.title}</h3>
                  <div className="tag-cluster" style={{ marginTop: '1rem' }}>
                    {group.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="tech-badge">{skill}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FAQ Section */}
        <section className="section" id="faq">
          <div className="container" style={{ maxWidth: '960px' }}>
            <motion.div 
              className="section-header" 
              style={{ textAlign: 'center', margin: '0 auto 2.25rem auto' }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-eyebrow">{t('faq.eyebrow')}</span>
              <h2 className="section-title">{t('faq.title')}</h2>
              <p className="text-muted section-desc" style={{ margin: '0 auto' }}>
                {t('faq.description')}
              </p>
            </motion.div>

            <div className="faq-accordion">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <motion.div 
                    key={idx} 
                    className={`faq-item ${isOpen ? 'active' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.42, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button 
                      type="button"
                      className="faq-question-btn" 
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <span className="faq-question-text">{faq.question}</span>
                      <ChevronDown 
                        size={20} 
                        className={`faq-chevron ${isOpen ? 'rotate' : ''}`} 
                        aria-hidden="true"
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-answer-content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ 
                            height: 'auto', 
                            opacity: 1,
                            transition: {
                              height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                              opacity: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
                            }
                          }}
                          exit={{ 
                            height: 0, 
                            opacity: 0,
                            transition: {
                              height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                              opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                            }
                          }}
                          className="faq-answer-wrap"
                          id={`faq-answer-${idx}`}
                        >
                          <p className="faq-answer">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Reach Out Section */}
        <section className="section" id="reach-out" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="container">
            <motion.div 
              className="section-header"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-eyebrow">{t('contact.eyebrow')}</span>
              <h2 className="section-title">{t('contact.title')}</h2>
              <p className="text-muted section-desc">
                {t('contact.description')}
              </p>
            </motion.div>

            <div className="reachout-grid">
              {/* Direct channels & info */}
              <motion.div 
                className="reachout-channels"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="reachout-status-card">
                  <div className="status-indicator">
                    <span className="status-indicator-dot pulse"></span>
                    <span className="status-label">{t('contact.availability')}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    {t('contact.statusTitle')}
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {t('contact.statusDesc')}
                  </p>
                </div>

                <div className="contact-links-list">
                  <div className="contact-card">
                    <div className="contact-card-icon">
                      <Mail size={22} />
                    </div>
                    <div className="contact-card-content">
                      <span className="contact-card-label">{t('contact.emailLabel')}</span>
                      <a href="mailto:ailmohamed@outlook.com" className="contact-card-val">
                        ailmohamed@outlook.com
                      </a>
                    </div>
                    <button 
                      onClick={handleCopyEmail} 
                      className="contact-action-btn"
                      aria-label={t('contact.copyEmail')}
                      title={copiedEmail ? t('contact.copied') : t('contact.copyEmail')}
                    >
                      {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  {/* Personal Birth Date & Age Card */}
                  <div className="contact-card">
                    <div className="contact-card-icon">
                      <Calendar size={22} />
                    </div>
                    <div className="contact-card-content">
                      <span className="contact-card-label">{t('contact.birthLabel')}</span>
                      <span className="contact-card-val">
                        {t('contact.birthDate')}{' '}
                        <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 400 }}>
                          • {userAge} {isFrench ? 'ans' : 'years old'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <a 
                    href="tel:+212689448142" 
                    className="contact-card clickable"
                  >
                    <div className="contact-card-icon">
                      <Phone size={22} />
                    </div>
                    <div className="contact-card-content">
                      <span className="contact-card-label">{t('contact.phoneLabel')}</span>
                      <span className="contact-card-val">+212 689 448 142</span>
                    </div>
                    <ArrowUpRight size={18} className="text-muted" />
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/mohamed-azil-3b303b365/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="contact-card clickable"
                  >
                    <div className="contact-card-icon">
                      <LinkedinIcon size={22} />
                    </div>
                    <div className="contact-card-content">
                      <span className="contact-card-label">LinkedIn</span>
                      <span className="contact-card-val">mohamed-azil-3b303b365</span>
                    </div>
                    <ArrowUpRight size={18} className="text-muted" />
                  </a>

                  <a 
                    href="https://github.com/Azil20" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="contact-card clickable"
                  >
                    <div className="contact-card-icon">
                      <GithubIcon size={22} />
                    </div>
                    <div className="contact-card-content">
                      <span className="contact-card-label">GitHub</span>
                      <span className="contact-card-val">github.com/Azil20</span>
                    </div>
                    <ArrowUpRight size={18} className="text-muted" />
                  </a>

                  {/* Curriculum Vitae Download Card */}
                  <div className="contact-card">
                    <div className="contact-card-icon">
                      <Download size={22} />
                    </div>
                    <div className="contact-card-content" style={{ width: '100%' }}>
                      <span className="contact-card-label">Curriculum Vitae</span>
                      <div className="contact-cv-actions">
                        <a 
                          href="/CV_Mohamed_Azil_EN.pdf" 
                          download="CV_Mohamed_AZIL_EN.pdf"
                          className="contact-cv-badge-btn"
                          title="Download English Resume (PDF)"
                        >
                          <Download size={13} />
                          <span>English (PDF)</span>
                        </a>
                        <a 
                          href="/CV_Mohamed_Azil_FR.pdf" 
                          download="CV_Mohamed_AZIL_FR.pdf"
                          className="contact-cv-badge-btn"
                          title="Télécharger CV Français (PDF)"
                        >
                          <Download size={13} />
                          <span>Français (PDF)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>

              {/* Interactive Contact Form */}
              <motion.div 
                className="reachout-form-wrapper"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <form className="contact-form" onSubmit={handleSendMessage}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">{t('contact.nameLabel')}</label>
                    <input 
                      type="text" 
                      id="name" 
                      required 
                      className="form-input" 
                      placeholder={t('contact.namePlaceholder')}
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">{t('contact.emailFieldLabel')}</label>
                    <input 
                      type="email" 
                      id="email" 
                      required 
                      className="form-input" 
                      placeholder={t('contact.emailPlaceholder')}
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">{t('contact.subjectLabel')}</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="form-input" 
                      placeholder={t('contact.subjectPlaceholder')}
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">{t('contact.messageLabel')}</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      required 
                      className="form-input" 
                      placeholder={t('contact.messagePlaceholder')}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn form-submit-btn" 
                    disabled={formStatus === 'sending' || formStatus === 'success'}
                  >
                    {formStatus === 'sending' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} /> {t('contact.sending')}
                      </>
                    ) : formStatus === 'success' ? (
                      <>
                        <Check size={18} style={{ marginRight: '8px', color: '#22c55e' }} /> {t('contact.sentSuccess')}
                      </>
                    ) : (
                      <>
                        <Send size={18} style={{ marginRight: '8px' }} /> {t('contact.sendBtn')}
                      </>
                    )}
                  </button>

                  {formStatus === 'error' && (
                    <div className="form-status-alert error" style={{ marginTop: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{formErrorMsg || t('contact.sentError')}</span>
                      </div>
                      <a 
                        href={`mailto:ailmohamed@outlook.com?subject=${encodeURIComponent(formState.subject.trim() || 'Contact Portfolio Mohamed Azil')}&body=${encodeURIComponent(`De: ${formState.name.trim()} (${formState.email.trim()})\n\n${formState.message.trim()}`)}`}
                        className="form-fallback-mailto-btn"
                        target="_blank"
                        rel="noreferrer"
                        title={isFrench ? "Envoyer directement via votre application de messagerie" : "Send directly via your email client"}
                      >
                        <Mail size={14} />
                        <span>{isFrench ? 'Envoyer directement par email (mailto)' : 'Send directly via email (mailto)'}</span>
                      </a>
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Engineering-Grade Footer matching image */}
        <Footer />
      </main>

      {/* Interactive System Architecture Modal */}
      <AnimatePresence>
        {activeArchProject && (
          <motion.div
            className="arch-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveArchProject(null)}
          >
            <motion.div
              className="arch-modal-dialog"
              initial={{ scale: 0.94, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 25 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="arch-modal-close"
                onClick={() => setActiveArchProject(null)}
                aria-label={t('projects.close_architecture')}
                title={t('projects.close_architecture')}
              >
                <X size={20} />
              </button>

              <div className="arch-modal-body">
                <div className="arch-modal-header">
                  <div className="arch-modal-meta">
                    <span className="project-badge">{activeArchProject.badge}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      • {t('projects.architecture_title')}
                    </span>
                  </div>
                  <h2 className="arch-modal-title">{activeArchProject.title}</h2>
                  <p className="arch-modal-subtitle">{activeArchProject.subtitle}</p>
                </div>

                {/* Architecture Overview */}
                <div className="arch-modal-overview">
                  <p>{activeArchProject.archOverview}</p>
                </div>

                {/* Engineering Highlights & Benchmarks */}
                <div className="arch-section-heading">
                  <Sparkles size={18} style={{ color: '#38bdf8' }} />
                  <span>{t('projects.pillars_heading')}</span>
                </div>
                <div className="arch-pillars-grid">
                  {activeArchProject.pillars.map((pil, pIdx) => (
                    <div key={pIdx} className="arch-pillar-card">
                      <div className="arch-pillar-val">{pil.val}</div>
                      <div className="arch-pillar-label">{pil.label}</div>
                      <div className="arch-pillar-desc">{pil.desc}</div>
                    </div>
                  ))}
                </div>

                {/* End-to-End Pipeline & Data Flow */}
                <div className="arch-section-heading">
                  <Layers size={18} style={{ color: '#38bdf8' }} />
                  <span>{t('projects.pipeline_heading')}</span>
                </div>
                <div className="arch-pipeline-list">
                  {activeArchProject.steps.map((step, sIdx) => (
                    <div key={sIdx} className="arch-pipeline-step">
                      <div className="arch-step-number">0{sIdx + 1}</div>
                      <div className="arch-step-content">
                        <h3 className="arch-step-title">{step.title}</h3>
                        <p className="arch-step-desc">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Cluster */}
                <div className="tag-cluster" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  {activeArchProject.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="tech-badge">{tag}</span>
                  ))}
                </div>

                <div className="arch-modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setActiveArchProject(null)}
                  >
                    {t('projects.close_architecture')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
