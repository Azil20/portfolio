import { Link } from 'react-router-dom';
import { Home as HomeIcon, Compass, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-badge">
          <span className="not-found-dot"></span>
          ERROR 404 // ROUTE NOT FOUND
        </div>

        <h1 className="not-found-title chrome-text">404</h1>

        <h2 className="not-found-subtitle">
          {isFrench ? 'Page Introuvable' : 'Signal Lost in Deep Space'}
        </h2>

        <p className="not-found-desc">
          {isFrench
            ? "Le vecteur ou la route demandée n'existe pas dans cette architecture. Utilisez les raccourcis ci-dessous pour revenir au portfolio."
            : "The neural vector or route you requested does not exist in this deployment. Use the shortcuts below to return to Mohamed Azil's portfolio."}
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn">
            <HomeIcon size={16} style={{ marginRight: '8px' }} />
            {isFrench ? "Retour à l'accueil" : 'Back to Home'}
          </Link>
          <a href="/#projects" className="btn btn-outline">
            <Compass size={16} style={{ marginRight: '8px' }} />
            {isFrench ? 'Voir les projets' : 'View Projects'}
          </a>
          <a href="/#reach-out" className="btn btn-outline">
            <Mail size={16} style={{ marginRight: '8px' }} />
            {isFrench ? 'Contacter Mohamed' : 'Contact Mohamed'}
          </a>
        </div>
      </div>
    </div>
  );
}
