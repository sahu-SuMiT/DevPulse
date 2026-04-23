import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDevelopers } from '../services/api';
import './DeveloperSelect.css';

export default function DeveloperSelect() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevelopers()
      .then(setDevelopers)
      .catch(err => console.error('Failed to load developers:', err))
      .finally(() => setLoading(false));
  }, []);

  const roleColors = {
    'Frontend Engineer': 'var(--accent-blue)',
    'Backend Engineer': 'var(--accent-violet)',
    'Full Stack Engineer': 'var(--accent-cyan)',
  };

  return (
    <main className="page-container" id="developer-select-page">
      <header className="page-header animate-fade-in-up">
        <h1 className="page-title">Developer Profiles</h1>
        <p className="page-subtitle">
          Select a developer to view their productivity metrics, insights, and recommended actions.
        </p>
      </header>

      {loading ? (
        <div className="dev-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="dev-card-skeleton skeleton" style={{ height: 200 }}></div>
          ))}
        </div>
      ) : (
        <div className="dev-grid">
          {developers.map((dev, index) => (
            <button
              key={dev.id}
              className={`dev-card glass-card animate-fade-in-up stagger-${index + 1}`}
              id={`dev-card-${dev.id}`}
              onClick={() => navigate(`/developer/${dev.id}`)}
            >
              <div
                className="dev-avatar"
                style={{ '--avatar-color': roleColors[dev.role] || 'var(--accent-blue)' }}
              >
                {dev.avatar}
              </div>
              <div className="dev-info">
                <h2 className="dev-name">{dev.name}</h2>
                <p className="dev-role" style={{ color: roleColors[dev.role] }}>{dev.role}</p>
                <div className="dev-meta">
                  <span className="dev-team">
                    <span className="dev-meta-icon">◆</span> {dev.team}
                  </span>
                  <span className="dev-joined">
                    Since {new Date(dev.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <span className="dev-arrow">→</span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
