import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DeveloperSelect from './pages/DeveloperSelect';
import Dashboard from './pages/Dashboard';
import ManagerSummary from './pages/ManagerSummary';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<DeveloperSelect />} />
        <Route path="/developer/:id" element={<Dashboard />} />
        <Route path="/manager" element={<ManagerSummary />} />
      </Routes>
    </>
  );
}

export default App;
