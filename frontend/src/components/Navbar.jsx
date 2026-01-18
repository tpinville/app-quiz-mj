import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">App Quiz MJ</Link>
      </div>
      <div className="navbar-links">
        <Link to="/leaderboard">Classement</Link>
        {isAuthenticated ? (
          <>
            <Link to="/quiz">Jouer</Link>
            <Link to="/history">Historique</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
            <span className="user-info">Bonjour, {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </div>
    </nav>
  );
}
