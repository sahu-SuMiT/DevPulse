import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInsights, fetchMonths } from '../services/api';
import MetricCard from '../components/MetricCard';
import InsightPanel from '../components/InsightPanel';
import ActionCard from '../components/ActionCard';
import MetricDetailModal from '../components/MetricDetailModal';
import './Dashboard.css';

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-05');
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState(null);

  // Fetch available months
  useEffect(() => {
    fetchMonths()
      .then(setMonths)
      .catch(err => console.error('Failed to load months:', err));
  }, []);

  // Fetch insights for selected developer + month
  useEffect(() => {
    setLoading(true);
    fetchInsights(id, selectedMonth)
      .then(setData)
      .catch(err => {
        console.error('Failed to load insights:', err);
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, selectedMonth, navigate]);

  const metricOrder = ['leadTime', 'cycleTime', 'bugRate', 'deploymentFrequency', 'prThroughput'];

  if (loading || !data) {
    return (
      <main className="page-container" id="dashboard-page">
        <div className="dashboard-loading">
          <div className="skeleton" style={{ height: 80, width: 300, marginBottom: 32 }}></div>
          <div className="metrics-grid">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton" style={{ height: 180 }}></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const { developer, narrative, metrics, actions, history } = data;

  return (
    <main className="page-container" id="dashboard-page">

      <header className="dashboard-header animate-fade-in-up">
        <button className="back-btn btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="dashboard-profile">
          <div
            className="dashboard-avatar"
            style={{
              '--avatar-color':
                developer.role === 'Frontend Engineer'
                  ? 'var(--accent-blue)'
                  : developer.role === 'Backend Engineer'
                  ? 'var(--accent-violet)'
                  : 'var(--accent-cyan)',
            }}
          >
            {developer.avatar}
          </div>
          <div className="dashboard-info">
            <h1 className="dashboard-name">{developer.name}</h1>
            <p className="dashboard-role">{developer.role} · {developer.team}</p>
          </div>
        </div>
        <div className="dashboard-controls">
          <div className="select-wrapper">
            <select
              className="select-input"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              id="month-selector"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>


      <section className="dashboard-metrics" id="metrics-section">
        <h2 className="section-title animate-fade-in">Performance Metrics</h2>
        <div className="metrics-grid">
          {metricOrder.map((key, index) => (
            <MetricCard
              key={key}
              metricName={key}
              data={metrics[key]}
              index={index}
              onClick={setActiveMetric}
            />
          ))}
        </div>
      </section>


      <InsightPanel narrative={narrative} metricInsights={metrics} />


      {actions && actions.length > 0 && (
        <section className="dashboard-actions" id="actions-section">
          <h2 className="section-title animate-fade-in" style={{ animationDelay: '0.35s', opacity: 0 }}>
            Recommended Actions
          </h2>
          <div className="actions-grid">
            {actions.map((action, index) => (
              <ActionCard key={action.id} action={action} index={index} />
            ))}
          </div>
        </section>
      )}


      {activeMetric && metrics[activeMetric] && (
        <MetricDetailModal
          metricName={activeMetric}
          data={metrics[activeMetric]}
          history={history}
          onClose={() => setActiveMetric(null)}
        />
      )}
    </main>
  );
}
