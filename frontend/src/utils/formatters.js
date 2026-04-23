export function formatDuration(hours) {
  if (hours === null || hours === undefined) return '—';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round((hours % 24) * 10) / 10;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
}

export function formatPercentage(value) {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

export function formatCount(value) {
  if (value === null || value === undefined) return '—';
  return value.toString();
}

export function formatMetricValue(metricName, value) {
  switch (metricName) {
    case 'leadTime':
    case 'cycleTime':
      return formatDuration(value);
    case 'bugRate':
      return formatPercentage(value);
    case 'deploymentFrequency':
    case 'prThroughput':
      return formatCount(value);
    default:
      return value?.toString() || '—';
  }
}

export function getMetricLabel(metricName) {
  const labels = {
    leadTime: 'Lead Time',
    cycleTime: 'Cycle Time',
    bugRate: 'Bug Rate',
    deploymentFrequency: 'Deploy Freq',
    prThroughput: 'PR Throughput',
  };
  return labels[metricName] || metricName;
}

export function getMetricDescription(metricName) {
  const descriptions = {
    leadTime: 'Avg time from PR opened to production deployment',
    cycleTime: 'Avg time from issue started to issue completed',
    bugRate: 'Escaped production bugs ÷ issues completed',
    deploymentFrequency: 'Successful production deployments this month',
    prThroughput: 'Merged pull requests this month',
  };
  return descriptions[metricName] || '';
}

export function getMetricUnit(metricName) {
  const units = {
    leadTime: 'hours',
    cycleTime: 'hours',
    bugRate: '%',
    deploymentFrequency: 'deploys',
    prThroughput: 'PRs',
  };
  return units[metricName] || '';
}

export function getStatusColor(status) {
  const colors = {
    good: 'var(--accent-emerald)',
    moderate: 'var(--accent-amber)',
    'needs-attention': 'var(--accent-rose)',
    'no-data': 'var(--text-tertiary)',
  };
  return colors[status] || 'var(--text-secondary)';
}

export function getStatusGlow(status) {
  const glows = {
    good: 'var(--shadow-glow-emerald)',
    moderate: 'var(--shadow-glow-amber)',
    'needs-attention': 'var(--shadow-glow-rose)',
  };
  return glows[status] || 'none';
}

export function getTrendArrow(direction) {
  const arrows = {
    up: '↑',
    down: '↓',
    stable: '→',
  };
  return arrows[direction] || '→';
}

export function isTrendPositive(metricName, direction) {
  const lowerIsBetter = ['leadTime', 'cycleTime', 'bugRate'];
  if (lowerIsBetter.includes(metricName)) {
    return direction === 'down';
  }
  return direction === 'up';
}
