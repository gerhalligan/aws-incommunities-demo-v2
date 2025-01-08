import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { calculateRegionalMetrics } from "../../utils/regionData";

interface GeographyBreakdownProps {
  selectedRegions: Set<string>;
}

export const GeographyBreakdown = ({ selectedRegions }: GeographyBreakdownProps) => {
  const metrics = calculateRegionalMetrics(selectedRegions);
  
  const geographyData = metrics.map((region) => ({
    name: region.region,
    investments: region.metrics.totalInvestment,
    beneficiaries: region.metrics.beneficiaries,
    volunteers: region.metrics.volunteerHours,
  }));

  const beneficiariesByPillar = metrics.reduce((acc, region) => {
    const total = region.metrics.beneficiaries;
    return [
      { name: "STEAM", value: Math.round(total * 0.4), color: "#10B981" },
      { name: "Skills Development", value: Math.round(total * 0.25), color: "#6366F1" },
      { name: "Sustainability", value: Math.round(total * 0.20), color: "#FBBF24" },
      { name: "Social Impact", value: Math.round(total * 0.15), color: "#A855F7" },
    ];
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Breakdown by geography</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geographyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="investments" fill="#10B981" name="Investments (€)" />
              <Bar dataKey="beneficiaries" fill="#6366F1" name="Beneficiaries" />
              <Bar dataKey="volunteers" fill="#FBBF24" name="Volunteer Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Beneficiaries by pillar</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={beneficiariesByPillar}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {beneficiariesByPillar.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {beneficiariesByPillar.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name} ({entry.value.toLocaleString()})
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};