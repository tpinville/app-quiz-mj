import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to Quiz App</h1>
        <p>Test your knowledge with our fun quizzes!</p>
        {isAuthenticated ? (
          <Link to="/quiz" className="btn btn-primary btn-large">
            Start Quiz
          </Link>
        ) : (
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-large">
              Login to Start
            </Link>
            <Link to="/register" className="btn btn-secondary btn-large">
              Create Account
            </Link>
          </div>
        )}
      </div>
      <div className="features">
        <div className="feature">
          <h3>Multiple Choice Questions</h3>
          <p>Answer questions from various topics</p>
        </div>
        <div className="feature">
          <h3>Track Your Progress</h3>
          <p>View your score history and improvement</p>
        </div>
        <div className="feature">
          <h3>Compete with Others</h3>
          <p>See how you rank on the leaderboard</p>
        </div>
      </div>
    </div>
  );
}
