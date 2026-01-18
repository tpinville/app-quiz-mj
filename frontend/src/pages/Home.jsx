import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Bienvenue sur App Quiz MJ</h1>
        <p>Testez vos connaissances avec nos quiz amusants !</p>
        {isAuthenticated ? (
          <Link to="/quiz" className="btn btn-primary btn-large">
            Commencer le Quiz
          </Link>
        ) : (
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-large">
              Se connecter
            </Link>
            <Link to="/register" className="btn btn-secondary btn-large">
              Créer un compte
            </Link>
          </div>
        )}
      </div>
      <div className="features">
        <div className="feature">
          <h3>Questions à Choix Multiples</h3>
          <p>Répondez à des questions sur divers sujets</p>
        </div>
        <div className="feature">
          <h3>Suivez Votre Progression</h3>
          <p>Consultez votre historique et votre évolution</p>
        </div>
        <div className="feature">
          <h3>Affrontez les Autres</h3>
          <p>Découvrez votre classement</p>
        </div>
      </div>
    </div>
  );
}
