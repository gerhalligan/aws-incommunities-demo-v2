import { DashboardMetrics } from '../components/DashboardMetrics';
import { ProgramOverview } from '../components/ProgramOverview';
import { RegionsFilter } from '../components/RegionsFilter';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { DashboardHeader } from '../components/DashboardHeader';
import '../styles/dashboard.css';

const DashboardIndex = () => {
  const { selectedRegions, setSelectedRegions } = useDashboard();

   return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <DashboardHeader />
      <div className="p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <header className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
                Program Impact Dashboard
              </h1>
              <p className="text-gray-600">
                Tracking our community initiatives and their impact
              </p>
            </div>
            <RegionsFilter 
              selectedRegions={selectedRegions} 
              onRegionSelect={setSelectedRegions} 
            />
          </header>

          {selectedRegions.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4 mb-6"
            >
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Selected Regions
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedRegions).map((region) => (
                  <div
                    key={region}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {region}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <DashboardMetrics selectedRegions={selectedRegions} />
          <ProgramOverview />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardIndex;