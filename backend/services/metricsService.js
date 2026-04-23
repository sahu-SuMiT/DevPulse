const issues = require('../data/issues.json');
const pullRequests = require('../data/pull_requests.json');
const deployments = require('../data/deployments.json');
const bugs = require('../data/bugs.json');

function hoursBetween(start, end) {
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
}

function calcLeadTime(developerId, month) {
  const devDeployments = deployments.filter(
    d => d.deployedBy === developerId && d.month === month && d.status === 'success'
  );

  if (devDeployments.length === 0) return null;

  const leadTimes = devDeployments.map(dep => {
    const pr = pullRequests.find(p => p.id === dep.prId);
    if (!pr) return null;
    return hoursBetween(pr.openedAt, dep.deployedAt);
  }).filter(lt => lt !== null);

  if (leadTimes.length === 0) return null;

  const avg = leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;
  return Math.round(avg * 10) / 10;
}

function calcCycleTime(developerId, month) {
  const devIssues = issues.filter(
    i => i.assignee === developerId && i.month === month && i.status === 'Done'
  );

  if (devIssues.length === 0) return null;

  const cycleTimes = devIssues.map(issue => {
    return hoursBetween(issue.inProgressAt, issue.doneAt);
  });

  const avg = cycleTimes.reduce((sum, ct) => sum + ct, 0) / cycleTimes.length;
  return Math.round(avg * 10) / 10;
}

function calcBugRate(developerId, month) {
  const completedIssues = issues.filter(
    i => i.assignee === developerId && i.month === month && i.status === 'Done'
  );

  const monthBugs = bugs.filter(
    b => b.assignee === developerId && b.month === month
  );

  if (completedIssues.length === 0) return null;

  const rate = (monthBugs.length / completedIssues.length) * 100;
  return Math.round(rate * 10) / 10;
}

function calcDeploymentFrequency(developerId, month) {
  return deployments.filter(
    d => d.deployedBy === developerId && d.month === month && d.status === 'success'
  ).length;
}

function calcPRThroughput(developerId, month) {
  return pullRequests.filter(
    p => p.author === developerId && p.month === month && p.mergedAt
  ).length;
}

function getMetrics(developerId, month) {
  return {
    leadTime: calcLeadTime(developerId, month),
    cycleTime: calcCycleTime(developerId, month),
    bugRate: calcBugRate(developerId, month),
    deploymentFrequency: calcDeploymentFrequency(developerId, month),
    prThroughput: calcPRThroughput(developerId, month),
  };
}

function getMetricsHistory(developerId) {
  const months = ['2025-03', '2025-04', '2025-05'];
  return months.map(month => ({
    month,
    ...getMetrics(developerId, month),
  }));
}

function getTeamMetrics(month) {
  const developers = require('../data/developers.json');
  const allMetrics = developers.map(dev => ({
    developer: dev,
    metrics: getMetrics(dev.id, month),
  }));

  const validMetrics = allMetrics.filter(m => m.metrics.leadTime !== null);
  const teamAvg = {
    leadTime: validMetrics.length > 0 
      ? Math.round(validMetrics.reduce((s, m) => s + m.metrics.leadTime, 0) / validMetrics.length * 10) / 10 
      : null,
    cycleTime: validMetrics.length > 0 
      ? Math.round(validMetrics.reduce((s, m) => s + m.metrics.cycleTime, 0) / validMetrics.length * 10) / 10 
      : null,
    bugRate: validMetrics.length > 0 
      ? Math.round(validMetrics.reduce((s, m) => s + m.metrics.bugRate, 0) / validMetrics.length * 10) / 10 
      : null,
    deploymentFrequency: Math.round(validMetrics.reduce((s, m) => s + m.metrics.deploymentFrequency, 0) / validMetrics.length * 10) / 10,
    prThroughput: Math.round(validMetrics.reduce((s, m) => s + m.metrics.prThroughput, 0) / validMetrics.length * 10) / 10,
  };

  return {
    teamAverage: teamAvg,
    developers: allMetrics,
  };
}

module.exports = {
  getMetrics,
  getMetricsHistory,
  getTeamMetrics,
  calcLeadTime,
  calcCycleTime,
  calcBugRate,
  calcDeploymentFrequency,
  calcPRThroughput,
};
