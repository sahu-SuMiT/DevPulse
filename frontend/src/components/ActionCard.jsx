import './ActionCard.css';

const CATEGORY_ICONS = {
  process: '⚙️',
  planning: '📋',
  quality: '🛡️',
  delivery: '🚀',
  growth: '🌱',
};

const PRIORITY_LABELS = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Suggested',
};

export default function ActionCard({ action, index = 0 }) {
  if (!action) return null;

  const icon = CATEGORY_ICONS[action.category] || '💡';

  return (
    <div
      className={`action-card glass-card animate-fade-in-up`}
      style={{ animationDelay: `${0.3 + index * 0.1}s`, opacity: 0 }}
      id={`action-${action.id}`}
    >
      <div className="action-card-header">
        <span className="action-icon">{icon}</span>
        <span className={`action-priority priority-${action.priority}`}>
          {PRIORITY_LABELS[action.priority]}
        </span>
      </div>
      <h3 className="action-title">{action.title}</h3>
      <p className="action-description">{action.description}</p>
      <div className="action-impact">
        <span className="action-impact-label">Expected Impact</span>
        <span className="action-impact-value">{action.impact}</span>
      </div>
    </div>
  );
}
