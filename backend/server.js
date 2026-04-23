const express = require('express');
const cors = require('cors');
const path = require('path');

const { getMetrics, getMetricsHistory, getTeamMetrics } = require('./services/metricsService');
const { getInsights } = require('./services/insightsService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const developers = require('./data/developers.json');

app.get('/api/developers', (req, res) => {
  res.json({ developers });
});

app.get('/api/developers/:id', (req, res) => {
  const dev = developers.find(d => d.id === req.params.id);
  if (!dev) {
    return res.status(404).json({ error: 'Developer not found' });
  }
  res.json({ developer: dev });
});

app.get('/api/developers/:id/metrics', (req, res) => {
  const dev = developers.find(d => d.id === req.params.id);
  if (!dev) {
    return res.status(404).json({ error: 'Developer not found' });
  }

  const month = req.query.month || '2025-05';
  const metrics = getMetrics(dev.id, month);
  const history = getMetricsHistory(dev.id);

  res.json({ 
    developer: dev,
    month,
    metrics,
    history,
  });
});

app.get('/api/developers/:id/insights', (req, res) => {
  const dev = developers.find(d => d.id === req.params.id);
  if (!dev) {
    return res.status(404).json({ error: 'Developer not found' });
  }

  const month = req.query.month || '2025-05';
  const insights = getInsights(dev.id, month);

  res.json({
    developer: dev,
    ...insights,
  });
});

app.get('/api/team/summary', (req, res) => {
  const month = req.query.month || '2025-05';
  const teamData = getTeamMetrics(month);
  
  res.json({
    month,
    ...teamData,
  });
});

app.get('/api/months', (req, res) => {
  res.json({
    months: [
      { value: '2025-03', label: 'March 2025' },
      { value: '2025-04', label: 'April 2025' },
      { value: '2025-05', label: 'May 2025' },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`\n  🚀 DevPulse API running at http://localhost:${PORT}`);
  console.log(`  📊 Try: http://localhost:${PORT}/api/developers\n`);
});
