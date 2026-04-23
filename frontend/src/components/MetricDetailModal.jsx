
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getMetricLabel,
  getMetricDescription,
  getMetricUnit,
  getStatusColor,
  formatMetricValue,
} from '../utils/formatters';
import './MetricDetailModal.css';

export default function MetricDetailModal({ metricName, data, history, onClose }) {
  if (!metricName || !data) return null;

  const label = getMetricLabel(metricName);
  const description = getMetricDescription(metricName);
  const unit = getMetricUnit(metricName);
  const color = getStatusColor(data.status);


  const chartData = history?.map(h => ({
    month: h.month?.replace('2025-', '') || '',
    value: h[metricName] ?? 0,
  })) || [];

  const monthLabels = { '03': 'Mar', '04': 'Apr', '05': 'May' };

  return (
    <div className="modal-overlay" onClick={onClose} id="metric-detail-modal">
      <div className="modal-content glass-card animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        
        <div className="modal-header">
          <h2 className="modal-title">{label}</h2>
          <span className={`status-badge status-${data.status}`}>{data.status?.replace('-', ' ')}</span>
        </div>
        
        <p className="modal-description">{description}</p>

        <div className="modal-value-section">
          <span className="modal-current-label">Current Value</span>
          <span className="modal-current-value" style={{ color }}>
            {formatMetricValue(metricName, data.value)}
          </span>
          <span className="modal-unit">{unit}</span>
        </div>


        <div className="modal-chart">
          <h3 className="modal-chart-title">3-Month Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <defs>
                <linearGradient id="modal-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                tickFormatter={m => monthLabels[m] || m}
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
                labelFormatter={m => monthLabels[m] || m}
                formatter={(val) => [formatMetricValue(metricName, val), label]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill="url(#modal-gradient)"
                dot={{ fill: color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--bg-primary)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>


        <div className="modal-interpretation">
          <h3 className="modal-interp-title">💡 Interpretation</h3>
          <p className="modal-interp-text">{data.interpretation}</p>
        </div>
      </div>
    </div>
  );
}
