import { Route, Routes } from 'react-router-dom';
import DashboardIndex from './pages/DashboardIndex';
import DashboardMetrics from './pages/DashboardMetrics';
import { DashboardProvider } from './context/DashboardContext';

export const DashboardRoutes = () => {
  return (
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<DashboardIndex />} />
        <Route path="/metrics" element={<DashboardMetrics />} />
      </Routes>
    </DashboardProvider>
  );
};