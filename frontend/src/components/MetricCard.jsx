import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  formatMetricValue,
  getMetricLabel,
  getMetricDescription,
  getStatusColor,
  getTrendArrow,
  isTrendPositive,
} from '../utils/formatters';
import './MetricCard.css';

export default function MetricCard({ metricName, data, index = 0, onClick }) {
  if (!data) return null;

  const { value, status, trend, interpretation } = data;
  const label = getMetricLabel(metricName);
  const description = getMetricDescription(metricName);
  const formattedValue = formatMetricValue(metricName, value);
  const statusColor = getStatusColor(status);
  const trendArrow = getTrendArrow(trend?.direction);
  const trendIsPositive = isTrendPositive(metricName, trend?.direction);

  const trendColor = trend?.direction === 'stable'
    ? 'var(--text-tertiary)'
    : trendIsPositive
      ? 'var(--accent-emerald)'
      : 'var(--accent-rose)';

  return (
    <div
      className={`metric-card glass-card animate-fade-in-up stagger-${index + 1}`}
      id={`metric-${metricName}`}
      onClick={() => onClick?.(metricName)}
      style={{ '--status-color': statusColor }}
      role="button"
      tabIndex={0}
    >
      <div className="metric-card-header">
        <span className="metric-label">{label}</span>
        <span className={`status-dot status-${status}`} title={status}></span>
      </div>

      <div className="metric-value-row">
        <span className="metric-value">{formattedValue}</span>
        {trend && trend.percentage > 0 && (
          <span className="metric-trend" style={{ color: trendColor }}>
            {trendArrow} {trend.percentage}%
          </span>
        )}
      </div>

      <p className="metric-description">{description}</p>

      <div className="metric-sparkline">
        <SparklineChart metricName={metricName} status={status} />
      </div>
    </div>
  );
}

function SparklineChart({ metricName, status }) {
  const sparkData = getSparkData(metricName);
  const color = getStatusColor(status);

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${metricName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${metricName})`}
          dot={false}
          isAnimationActive={true}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function getSparkData(metricName) {
  const patterns = {
    leadTime: [50, 45, 55, 48, 42, 52, 47],
    cycleTime: [70, 65, 80, 72, 68, 75, 62],
    bugRate: [35, 25, 30, 20, 28, 22, 25],
    deploymentFrequency: [3, 4, 5, 4, 6, 5, 4],
    prThroughput: [3, 4, 5, 4, 3, 5, 4],
  };
  return (patterns[metricName] || [1, 2, 3, 2, 3]).map((v, i) => ({ i, v }));
}
