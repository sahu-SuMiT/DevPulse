import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeamSummary, fetchMonths } from '../services/api';
import { formatMetricValue, getStatusColor } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ManagerSummary.css';

export default function ManagerSummary() {
  const [data, setData] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-05');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMonths().then(setMonths).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTeamSummary(selectedMonth)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const metricLabels = {
    leadTime: 'Lead Time (h)',
    cycleTime: 'Cycle Time (h)',
    bugRate: 'Bug Rate (%)',
    deploymentFrequency: 'Deploys',
    prThroughput: 'PRs Merged',
  };

  if (loading || !data) {
    return (
      <main className="page-container" id="manager-page">
        <div className="skeleton" style={{ height: 60, width: 300, marginBottom: 32 }}></div>
        <div className="skeleton" style={{ height: 400 }}></div>
      </main>
    );
  }

  // Build chart data for comparison
  const chartData = data.developers.map(d => ({
    name: d.developer.name.split(' ')[0],
    fullName: d.developer.name,
    leadTime: d.metrics.leadTime,
    cycleTime: d.metrics.cycleTime,
    bugRate: d.metrics.bugRate,
    deploymentFrequency: d.metrics.deploymentFrequency,
    prThroughput: d.metrics.prThroughput,
  }));

  const barColors = ['var(--accent-blue)', 'var(--accent-violet)', 'var(--accent-cyan)', 'var(--accent-emerald)'];

  return (
    <main className="page-container" id="manager-page">
      <header className="page-header animate-fade-in-up">
        <div className="manager-header-row">
          <div>
            <h1 className="page-title">Team Overview</h1>
            <p className="page-subtitle">Aggregated developer productivity metrics for your team.</p>
          </div>
          <div className="select-wrapper">
            <select
              className="select-input"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              id="manager-month-selector"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Team Averages */}
      <section className="team-averages animate-fade-in-up stagger-1" id="team-averages">
        <h2 className="section-title">Team Averages</h2>
        <div className="metrics-grid">
          {Object.entries(data.teamAverage).map(([key, value]) => (
            <div key={key} className="team-avg-card glass-card">
              <span className="team-avg-label">{metricLabels[key]}</span>
              <span className="team-avg-value">{formatMetricValue(key, value)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Comparison Chart */}
      <section className="team-chart-section animate-fade-in-up stagger-2" id="team-chart">
        <h2 className="section-title">PR Throughput Comparison</h2>
        <div className="team-chart glass-card">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 13 }}
                axisLine={{ stroke: 'var(--border-glass)' }}
              />
              <YAxis
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-glass)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                labelFormatter={(_, payload) => payload[0]?.payload?.fullName || ''}
              />
              <Bar dataKey="prThroughput" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Developer Table */}
      <section className="team-table-section animate-fade-in-up stagger-3" id="team-table">
        <h2 className="section-title">Individual Breakdown</h2>
        <div className="team-table-wrapper glass-card">
          <table className="team-table">
            <thead>
              <tr>
                <th>Developer</th>
                <th>Lead Time</th>
                <th>Cycle Time</th>
                <th>Bug Rate</th>
                <th>Deploys</th>
                <th>PRs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.developers.map(d => (
                <tr key={d.developer.id} id={`team-row-${d.developer.id}`}>
                  <td>
                    <div className="team-dev-cell">
                      <span className="team-dev-name">{d.developer.name}</span>
                      <span className="team-dev-role">{d.developer.role}</span>
                    </div>
                  </td>
                  <td>{formatMetricValue('leadTime', d.metrics.leadTime)}</td>
                  <td>{formatMetricValue('cycleTime', d.metrics.cycleTime)}</td>
                  <td>{formatMetricValue('bugRate', d.metrics.bugRate)}</td>
                  <td>{formatMetricValue('deploymentFrequency', d.metrics.deploymentFrequency)}</td>
                  <td>{formatMetricValue('prThroughput', d.metrics.prThroughput)}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/developer/${d.developer.id}`)}
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
