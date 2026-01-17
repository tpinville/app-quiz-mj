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
        <Link to="/">Quiz App</Link>
      </div>
      <div className="navbar-links">
        <Link to="/leaderboard">Leaderboard</Link>
        {isAuthenticated ? (
          <>
            <Link to="/quiz">Take Quiz</Link>
            <Link to="/history">History</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
            <span className="user-info">Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
