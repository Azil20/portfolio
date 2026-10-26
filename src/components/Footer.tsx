import { ArrowUp, Download, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="engineering-footer">
      <div className="container">
        {/* Top 4-Column Grid */}
        <div className="footer-columns-grid">
          {/* Col 1: Bio & Status */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-title">
              MOHAMED AZIL <span className="footer-brand-divider" aria-hidden="true">//</span> AI &amp; BIG DATA
            </div>
            <p className="footer-bio-text">
              {isFrench
                ? "Étudiant en dernière année de Master (M2) Big Data, Intelligence Artificielle et Applications Avancées à l'Université Ibn Tofaïl (Kénitra). Spécialisé en conception de pipelines IA, NLP et architectures Big Data distribuées."
                : "Software & AI Engineer and final-year Master 2 student in Big Data & AI at Université Ibn Tofaïl (FSK Kénitra). Specialized in Machine Learning, NLP, Distributed Systems (Hadoop, Spark) & Production AI Pipelines."}
            </p>
            <div className="footer-status-indicator">
              <span className="status-indicator-dot pulse"></span>
              <span className="footer-status-text">
                {isFrench 
                  ? "Disponible pour Stage PFE (Février 2027)" 
                  : "Available for PFE Internship (Feb 2027)"}
              </span>
            </div>
          </div>

          {/* Col 2: Engineered Systems */}
          <div className="footer-col">
            <h3 className="footer-col-heading">ENGINEERED SYSTEMS</h3>
            <ul className="footer-links-list">
              <li>
                <a href="#projects" className="footer-nav-link">
                  BMA (Mental Health AI)
                </a>
              </li>
              <li>
                <a href="#projects" className="footer-nav-link">
                  FraudGuard (Banking ML)
                </a>
              </li>
              <li>
                <a href="#projects" className="footer-nav-link">
                  IntelEJ Medical Center
                </a>
              </li>
              <li>
                <a href="#projects" className="footer-nav-link">
                  Al-Rāzī Medical Triage
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical Stack */}
          <div className="footer-col">
            <h3 className="footer-col-heading">TECHNICAL STACK</h3>
            <ul className="footer-links-list">
              <li>Python, C++ &amp; Java 17/21</li>
              <li>PyTorch, DistilBERT &amp; Gemini API</li>
              <li>Hadoop, Spark &amp; Big Data</li>
              <li>FastAPI, Flask &amp; React 18</li>
              <li>PostgreSQL, MySQL &amp; Supabase</li>
              <li>Linux Hardening &amp; Networks</li>
            </ul>
          </div>

          {/* Col 4: Credentials & CV Downloads */}
          <div className="footer-col">
            <h3 className="footer-col-heading">CREDENTIALS &amp; CVS</h3>
            <div className="footer-cv-downloads">
              <a 
                href="/CV_Mohamed_Azil_EN.pdf" 
                download="CV_Mohamed_AZIL_EN.pdf"
                className="footer-cv-download-btn"
                title="Download English Resume (PDF)"
              >
                <Download size={15} />
                <span>English Resume (PDF)</span>
              </a>
              <a 
                href="/CV_Mohamed_Azil_FR.pdf" 
                download="CV_Mohamed_AZIL_FR.pdf"
                className="footer-cv-download-btn"
                title="Télécharger CV Français (PDF)"
              >
                <Download size={15} />
                <span>CV Français (PDF)</span>
              </a>
            </div>

            <ul className="footer-credentials-list">
              <li>
                <span className="cred-dot"></span>
                <span>{isFrench ? "Né le 10/06/2004 (10 Juin 2004)" : "Born June 10, 2004 (10/06/2004)"}</span>
              </li>
              <li>
                <span className="cred-dot"></span>
                <span>Master Big Data &amp; IA (M2 · FSK)</span>
              </li>
              <li>
                <span className="cred-dot"></span>
                <span>Licence SMI (Maths &amp; Info · FSK)</span>
              </li>
              <li>
                <span className="cred-dot"></span>
                <span>BTS Systèmes &amp; Réseaux (LyTech)</span>
              </li>
              <li>
                <span className="cred-dot"></span>
                <span>Oracle AI Database Associate (1Z0-1195)</span>
              </li>
              <li>
                <span className="cred-dot"></span>
                <span>Oracle Cloud AI Associate (1Z0-1122)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Row: Social Channels & Back to Top */}
        <div className="footer-middle-bar">
          <div className="footer-social-links">
            <a 
              href="https://github.com/Azil20" 
              target="_blank" 
              rel="noreferrer" 
              className="footer-social-link"
              title="GitHub Profile"
            >
              <GithubIcon size={16} />
              <span>GitHub (@Azil20)</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/mohamed-azil-3b303b365/" 
              target="_blank" 
              rel="noreferrer" 
              className="footer-social-link"
              title="LinkedIn Profile"
            >
              <LinkedinIcon size={16} />
              <span>LinkedIn (/in/mohamed-azil)</span>
            </a>
            <a 
              href="mailto:ailmohamed@outlook.com" 
              className="footer-social-link"
              title="Direct Email"
            >
              <Mail size={16} />
              <span>ailmohamed@outlook.com</span>
            </a>
            <a 
              href="tel:+212689448142" 
              className="footer-social-link"
              title="Direct Phone"
            >
              <Phone size={16} />
              <span>+212 689 448 142</span>
            </a>
          </div>

          <button 
            type="button" 
            onClick={scrollToTop} 
            className="footer-back-to-top"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>

        {/* Bottom Bar: Copyright, Coordinates, Tech Stack */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {new Date().getFullYear()} Mohamed Azil. All rights reserved.
          </div>
          <div className="footer-coordinates">
            <span className="coord-dot" aria-hidden="true"></span>
            <span>All systems operational</span>
            <span className="coord-sep" aria-hidden="true">·</span>
            <span className="coord-geo">34.26° N, 6.58° W</span>
          </div>
          <div className="footer-tech-stack">
            React 18 · TypeScript · Vite · Three.js · Gemini 2.5
          </div>
        </div>
      </div>
    </footer>
  );
}
