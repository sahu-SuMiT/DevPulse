const { getMetrics, getMetricsHistory } = require('./metricsService');

const THRESHOLDS = {
  leadTime: { good: 48, moderate: 96 },
  cycleTime: { good: 72, moderate: 120 },
  bugRate: { good: 20, moderate: 40 },
  deploymentFrequency: { good: 4, moderate: 2 },
  prThroughput: { good: 4, moderate: 2 },
};

function classifyMetric(metricName, value) {
  if (value === null || value === undefined) return 'no-data';
  
  const threshold = THRESHOLDS[metricName];
  if (!threshold) return 'unknown';

  if (['leadTime', 'cycleTime', 'bugRate'].includes(metricName)) {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.moderate) return 'moderate';
    return 'needs-attention';
  }

  if (value >= threshold.good) return 'good';
  if (value >= threshold.moderate) return 'moderate';
  return 'needs-attention';
}

function calcTrend(current, previous) {
  if (current === null || previous === null || previous === 0) {
    return { direction: 'stable', percentage: 0 };
  }
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(change));
  
  if (Math.abs(change) < 5) return { direction: 'stable', percentage: rounded };
  return { direction: change > 0 ? 'up' : 'down', percentage: rounded };
}

function interpretMetric(metricName, value, trend, status) {
  const interpretations = {
    leadTime: {
      good: `Your lead time of ${value} hours is excellent — code is reaching production quickly.`,
      moderate: `Your lead time of ${value} hours is acceptable but could be improved. PRs might be waiting in review queues.`,
      'needs-attention': `Your lead time of ${value} hours is high. There may be bottlenecks in code review or deployment processes.`,
    },
    cycleTime: {
      good: `Cycle time of ${value} hours shows you're completing work efficiently from start to finish.`,
      moderate: `Your cycle time of ${value} hours suggests some tasks may be getting blocked mid-stream.`,
      'needs-attention': `A cycle time of ${value} hours indicates issues are taking too long to complete. Consider whether work items are too large or have external dependencies.`,
    },
    bugRate: {
      good: `A bug rate of ${value}% is healthy — your code quality is strong.`,
      moderate: `Bug rate of ${value}% — a few escaped bugs. Consider adding more test coverage for edge cases.`,
      'needs-attention': `A ${value}% bug rate is concerning. Multiple production bugs suggest gaps in testing or rushed code reviews.`,
    },
    deploymentFrequency: {
      good: `${value} deployments this month shows a healthy continuous delivery practice.`,
      moderate: `${value} deployments — you're shipping, but there may be room to deploy smaller changes more often.`,
      'needs-attention': `Only ${value} deployment(s) this month. Batching too many changes into each release can increase risk.`,
    },
    prThroughput: {
      good: `${value} merged PRs this month — strong output and consistent delivery.`,
      moderate: `${value} merged PRs — steady throughput. Breaking down work into smaller PRs can help.`,
      'needs-attention': `Only ${value} merged PR(s). This may indicate blockers, large PRs, or context switching.`,
    },
  };

  const base = interpretations[metricName]?.[status] || `${metricName}: ${value}`;
  
  if (trend.direction === 'up' && trend.percentage > 10) {
    const isPositive = ['deploymentFrequency', 'prThroughput'].includes(metricName);
    return base + (isPositive 
      ? ` This is up ${trend.percentage}% from last month — great momentum!`
      : ` This increased ${trend.percentage}% from last month — worth investigating.`);
  }
  if (trend.direction === 'down' && trend.percentage > 10) {
    const isPositive = ['deploymentFrequency', 'prThroughput'].includes(metricName);
    return base + (isPositive 
      ? ` This dropped ${trend.percentage}% from last month.`
      : ` This improved ${trend.percentage}% from last month — nice work!`);
  }
  
  return base;
}

function generateNarrative(metrics, statuses, trends) {
  const attentionMetrics = Object.entries(statuses)
    .filter(([_, s]) => s === 'needs-attention')
    .map(([name]) => name);
  
  const goodMetrics = Object.entries(statuses)
    .filter(([_, s]) => s === 'good')
    .map(([name]) => name);

  if (attentionMetrics.length === 0 && goodMetrics.length >= 4) {
    return {
      summary: "You're performing exceptionally well across all metrics this month.",
      tone: 'positive',
      headline: '🌟 Outstanding Performance',
    };
  }

  if (attentionMetrics.length >= 3) {
    return {
      summary: "Several metrics need attention this month. This could indicate systemic issues like large work items, insufficient test coverage, or process bottlenecks. Let's focus on the highest-impact area first.",
      tone: 'concern',
      headline: '⚠️ Multiple Areas Need Attention',
    };
  }

  if (statuses.leadTime === 'needs-attention' && statuses.cycleTime === 'needs-attention') {
    return {
      summary: "Both lead time and cycle time are elevated. This often means work items are too large or there are review/deployment bottlenecks slowing everything down. Breaking tasks into smaller pieces usually helps both metrics.",
      tone: 'coaching',
      headline: '🔍 Delivery Speed Bottleneck Detected',
    };
  }

  if (statuses.bugRate === 'needs-attention' && statuses.prThroughput === 'good') {
    return {
      summary: "You're shipping at a good pace, but the bug rate suggests quality may be slipping. High throughput with high bugs often means rushing through reviews or skipping test coverage on edge cases.",
      tone: 'coaching',
      headline: '⚖️ Speed vs Quality Trade-off',
    };
  }

  if (attentionMetrics.length > 0) {
    const metricLabels = {
      leadTime: 'lead time',
      cycleTime: 'cycle time',
      bugRate: 'bug rate',
      deploymentFrequency: 'deployment frequency',
      prThroughput: 'PR throughput',
    };
    const names = attentionMetrics.map(m => metricLabels[m]).join(' and ');
    return {
      summary: `Most metrics look healthy, but your ${names} could use some attention. Focus on the suggested actions below to bring things back on track.`,
      tone: 'balanced',
      headline: '📊 Mostly on Track',
    };
  }

  return {
    summary: "Your metrics are in a healthy range this month. Keep up the good work and look for small improvements.",
    tone: 'positive',
    headline: '✅ Solid Performance',
  };
}

function generateActions(metrics, statuses, trends) {
  const actions = [];

  if (statuses.leadTime === 'needs-attention') {
    actions.push({
      id: 'reduce-lead-time',
      title: 'Reduce PR Review Wait Time',
      description: 'Your PRs are taking a long time to reach production. Try requesting reviews from team members who are less loaded, or pair on complex reviews synchronously.',
      priority: 'high',
      impact: 'Could reduce lead time by 30-50%',
      category: 'process',
    });
  }

  if (statuses.leadTime === 'moderate') {
    actions.push({
      id: 'optimize-pipeline',
      title: 'Streamline Your Deployment Pipeline',
      description: 'Look for manual steps in your merge-to-deploy flow. Automating just one manual step can significantly cut lead time.',
      priority: 'medium',
      impact: 'Could reduce lead time by 15-25%',
      category: 'process',
    });
  }

  if (statuses.cycleTime === 'needs-attention') {
    actions.push({
      id: 'break-down-tasks',
      title: 'Break Down Large Work Items',
      description: 'Your cycle time is high, likely because issues are too large. Try splitting your next feature into 2-3 smaller tasks that can each be completed in under 2 days.',
      priority: 'high',
      impact: 'Could reduce cycle time by 40-60%',
      category: 'planning',
    });
  }

  if (statuses.bugRate === 'needs-attention') {
    actions.push({
      id: 'improve-testing',
      title: 'Add Edge Case Test Coverage',
      description: 'Your bug rate is elevated. Before your next PR, write at least 2 tests specifically for edge cases (null inputs, boundary values, error paths).',
      priority: 'high',
      impact: 'Could reduce bug rate by 30-50%',
      category: 'quality',
    });
  }

  if (statuses.bugRate === 'moderate') {
    actions.push({
      id: 'review-checklist',
      title: 'Create a Pre-Merge Checklist',
      description: 'Add a quick checklist to your PR template: error handling covered? Tests for happy + sad paths? Logging in place? This catches common issues before they reach production.',
      priority: 'medium',
      impact: 'Preventative measure for quality',
      category: 'quality',
    });
  }

  if (statuses.deploymentFrequency === 'needs-attention') {
    actions.push({
      id: 'deploy-more-often',
      title: 'Ship Smaller, Ship More Often',
      description: 'Low deployment frequency increases risk per deploy. Try to merge and deploy at least once per week to keep changes small and reversible.',
      priority: 'medium',
      impact: 'Reduces risk and enables faster feedback',
      category: 'delivery',
    });
  }

  if (statuses.prThroughput === 'needs-attention') {
    actions.push({
      id: 'smaller-prs',
      title: 'Aim for Smaller Pull Requests',
      description: 'Low PR count often means PRs are too large. Target PRs under 200 lines — they get reviewed faster and are easier to debug if issues arise.',
      priority: 'medium',
      impact: 'Faster reviews, less rework',
      category: 'delivery',
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: 'mentor-others',
      title: 'Share Your Practices with the Team',
      description: "Your metrics are strong. Consider documenting your workflow or pair programming with a teammate to help elevate the whole team's performance.",
      priority: 'low',
      impact: 'Team-level improvement',
      category: 'growth',
    });
    actions.push({
      id: 'stretch-goals',
      title: 'Take On a Stretch Challenge',
      description: "You're in a great rhythm. Consider picking up a technically challenging task or contributing to a cross-team initiative to grow your impact.",
      priority: 'low',
      impact: 'Personal growth and visibility',
      category: 'growth',
    });
  }

  return actions.slice(0, 3);
}

function getInsights(developerId, month) {
  const history = getMetricsHistory(developerId);
  const months = ['2025-03', '2025-04', '2025-05'];
  const monthIndex = months.indexOf(month);
  
  const currentMetrics = getMetrics(developerId, month);
  const previousMetrics = monthIndex > 0 ? getMetrics(developerId, months[monthIndex - 1]) : null;

  const statuses = {};
  for (const key of Object.keys(currentMetrics)) {
    statuses[key] = classifyMetric(key, currentMetrics[key]);
  }

  const trends = {};
  for (const key of Object.keys(currentMetrics)) {
    trends[key] = previousMetrics 
      ? calcTrend(currentMetrics[key], previousMetrics[key]) 
      : { direction: 'stable', percentage: 0 };
  }

  const metricInsights = {};
  for (const key of Object.keys(currentMetrics)) {
    metricInsights[key] = {
      value: currentMetrics[key],
      status: statuses[key],
      trend: trends[key],
      interpretation: interpretMetric(key, currentMetrics[key], trends[key], statuses[key]),
    };
  }

  const narrative = generateNarrative(currentMetrics, statuses, trends);
  const actions = generateActions(currentMetrics, statuses, trends);

  return {
    developerId,
    month,
    metrics: metricInsights,
    narrative,
    actions,
    history: history.map(h => ({ month: h.month, ...h })),
  };
}

module.exports = {
  getInsights,
  classifyMetric,
  THRESHOLDS,
};
