# DevPulse — Developer Productivity MVP

A focused, full-stack MVP that helps individual contributors understand their productivity metrics, interpret the story behind them, and take practical action.

> **User Journey**: Select Developer → View Metrics → Read Insights → Take Action

![React](https://img.shields.io/badge/React-18-blue) ![Express](https://img.shields.io/badge/Express-4-green) ![Vite](https://img.shields.io/badge/Vite-8-purple)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd project

# 2. Start Backend (Terminal 1)
cd backend
npm install
node server.js
# → API running at http://localhost:3001

# 3. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# → App running at http://localhost:5173
```

---

## 📊 The 5 Metrics

These metrics follow the **simplified definitions** from the assignment workbook:

| Metric | Definition | Calculation |
|--------|-----------|-------------|
| **Lead Time for Changes** | Avg time from PR opened → production deployment | `avg(deployment.deployedAt - pr.openedAt)` |
| **Cycle Time** | Avg time from issue In Progress → issue Done | `avg(issue.doneAt - issue.inProgressAt)` |
| **Bug Rate** | Escaped production bugs ÷ issues completed | `(bugs / completedIssues) × 100` |
| **Deployment Frequency** | Successful production deployments per month | `count(successfulDeploys)` |
| **PR Throughput** | Merged pull requests per month | `count(mergedPRs)` |

---

## 🏗 Architecture

```
project/
├── backend/
│   ├── server.js                  # Express API (6 endpoints)
│   ├── services/
│   │   ├── metricsService.js      # Metric calculation logic
│   │   └── insightsService.js     # Interpretation + action engine
│   └── data/
│       ├── developers.json        # Developer dimension data
│       ├── issues.json            # Jira-like issue tracking
│       ├── pull_requests.json     # GitHub-like PR data
│       ├── deployments.json       # CI/CD deployment records
│       └── bugs.json              # Post-release bug reports
│
└── frontend/
    └── src/
        ├── components/
        │   ├── MetricCard.jsx     # Metric display with sparkline
        │   ├── InsightPanel.jsx   # Narrative interpretation
        │   ├── ActionCard.jsx     # Suggested next steps
        │   ├── MetricDetailModal  # Drill-down with trend chart
        │   └── Navbar.jsx         # Navigation
        ├── pages/
        │   ├── DeveloperSelect    # Landing page
        │   ├── Dashboard          # IC metrics + insights
        │   └── ManagerSummary     # Team overview (stretch)
        ├── services/api.js        # API client
        └── utils/formatters.js    # Display utilities
```

---

## 🔑 Key Design Decisions

### Why a Rules-Based Insights Engine?
Instead of just displaying metrics, the `insightsService.js` uses threshold-based classification and pattern detection to generate:
- **Health status** (good / moderate / needs-attention) per metric
- **Cross-metric patterns** (e.g., high throughput + high bugs = "Speed vs Quality Trade-off")
- **Prioritized action suggestions** with expected impact

### Why Not a Database?
The assignment focuses on product thinking and metric logic, not infrastructure. JSON files keep the setup trivial (no DB install) while fully simulating the workbook's 5 source tables.

### Why Dark Glassmorphism?
Premium visual design demonstrates frontend quality and attention to detail. The design system uses CSS custom properties for consistent theming.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/developers` | List all developers |
| GET | `/api/developers/:id` | Single developer profile |
| GET | `/api/developers/:id/metrics?month=YYYY-MM` | Computed metrics |
| GET | `/api/developers/:id/insights?month=YYYY-MM` | Metrics + interpretations + actions |
| GET | `/api/team/summary?month=YYYY-MM` | Team aggregated metrics |
| GET | `/api/months` | Available time periods |

---

## 📦 Data Model

The mock data simulates 5 separate systems with **4 developers across 3 months** (March–May 2025):

```
developers (4) ──┐
                  ├── issues (40) ──── bugs (16)
pull_requests (40) ──┤
                  └── deployments (40)
```

**Relationships:**
- Issues are assigned to developers
- PRs are authored by developers and linked to issues
- Deployments reference PRs
- Bugs reference the original issue that caused them

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite 8, React Router v6, Recharts
- **Styling**: Vanilla CSS with custom properties (dark theme, glassmorphism)
- **Backend**: Express.js 4, Node.js
- **Data**: Static JSON (mock data)

---

## 📝 License

Built for the Developer Productivity MVP Intern Assignment.
