import { Route, Routes } from 'react-router-dom';
import DashboardIndex from './pages/DashboardIndex';
import DashboardMetrics from './pages/DashboardMetrics';

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardIndex />} />
      <Route path="/dashboard" element={<DashboardIndex />} />
      <Route path="/dashboard/metrics" element={<DashboardMetrics />} />
    </Routes>
  );
};