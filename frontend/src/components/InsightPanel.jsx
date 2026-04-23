import './InsightPanel.css';

export default function InsightPanel({ narrative, metricInsights }) {
  if (!narrative) return null;

  const toneStyles = {
    positive: { icon: '🌟', accentClass: 'insight-positive' },
    coaching: { icon: '🔍', accentClass: 'insight-coaching' },
    concern: { icon: '⚠️', accentClass: 'insight-concern' },
    balanced: { icon: '📊', accentClass: 'insight-balanced' },
  };

  const style = toneStyles[narrative.tone] || toneStyles.balanced;

  return (
    <section className="insight-panel animate-fade-in-up stagger-6" id="insight-panel">
      <div className={`insight-card glass-card ${style.accentClass}`}>
        <div className="insight-header">
          <span className="insight-icon">{style.icon}</span>
          <div>
            <h2 className="insight-headline">{narrative.headline}</h2>
            <p className="insight-label">What your metrics are telling us</p>
          </div>
        </div>
        <p className="insight-summary">{narrative.summary}</p>

        {metricInsights && (
          <div className="insight-details">
            {Object.entries(metricInsights).map(([key, insight]) => (
              <div key={key} className="insight-detail-item">
                <span className={`insight-detail-dot status-${insight.status}`}></span>
                <p className="insight-detail-text">{insight.interpretation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
