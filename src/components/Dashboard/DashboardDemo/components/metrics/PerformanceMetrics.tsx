import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from "recharts";
import { calculateRegionalMetrics } from "../../utils/regionData";

interface PerformanceMetricsProps {
  selectedRegions: Set<string>;
}

export const PerformanceMetrics = ({ selectedRegions }: PerformanceMetricsProps) => {
  const metrics = calculateRegionalMetrics(selectedRegions);
  
  const totalMetrics = metrics.reduce((acc, region) => {
    acc.totalInvestment += region.metrics.totalInvestment;
    acc.beneficiaries += region.metrics.beneficiaries;
    acc.volunteerHours += region.metrics.volunteerHours;
    acc.projects += region.metrics.projects;
    return acc;
  }, {
    totalInvestment: 0,
    beneficiaries: 0,
    volunteerHours: 0,
    projects: 0
  });

  const performanceData = [
    { metric: "What", value: Math.min(3, (totalMetrics.projects / 100) * 3) },
    { metric: "Who", value: Math.min(3, (totalMetrics.beneficiaries / 50000) * 3) },
    { metric: "How much", value: Math.min(3, (totalMetrics.totalInvestment / 5000000) * 3) },
    { metric: "Contribution", value: Math.min(3, (totalMetrics.volunteerHours / 20000) * 3) },
    { metric: "Low risk", value: 2.3 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Funds invested</p>
            <p className="text-xl font-semibold">
              €{totalMetrics.totalInvestment.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Funds executed</p>
            <p className="text-xl font-semibold">
              €{Math.round(totalMetrics.totalInvestment * 0.75).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total direct beneficiaries</p>
            <p className="text-xl font-semibold">
              {totalMetrics.beneficiaries.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hours of volunteering</p>
            <p className="text-xl font-semibold">
              {totalMetrics.volunteerHours.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">IMP Impact Dimensions</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <Tooltip />
              <Radar
                name="Impact Score"
                dataKey="value"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};