import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { calculateRegionalMetrics } from "../../utils/regionData";
import { Microscope, GraduationCap, Leaf, Heart } from "lucide-react";

interface MetricsOverviewProps {
  selectedRegions: Set<string>;
}

export const MetricsOverview = ({ selectedRegions }: MetricsOverviewProps) => {
  const metrics = calculateRegionalMetrics(selectedRegions);
  
  const totalMetrics = metrics.reduce((acc, region) => {
    acc.steam += Math.round(region.metrics.beneficiaries * 0.4);
    acc.skills += Math.round(region.metrics.beneficiaries * 0.25);
    acc.sustainability += Math.round(region.metrics.beneficiaries * 0.2);
    acc.social += Math.round(region.metrics.beneficiaries * 0.15);
    return acc;
  }, {
    steam: 0,
    skills: 0,
    sustainability: 0,
    social: 0
  });

  const metricsData = [
    {
      title: "STEAM",
      value: totalMetrics.steam.toLocaleString(),
      label: "Number of students enrolled",
      color: "bg-blue-100",
      icon: <Microscope className="w-5 h-5 text-blue-600" />,
      breakdown: metrics.map(region => ({
        label: region.region,
        value: Math.round(region.metrics.beneficiaries * 0.4).toLocaleString()
      }))
    },
    {
      title: "Skills Development",
      value: totalMetrics.skills.toLocaleString(),
      label: "Number of people trained",
      color: "bg-cyan-100",
      icon: <GraduationCap className="w-5 h-5 text-cyan-600" />,
      breakdown: metrics.map(region => ({
        label: region.region,
        value: Math.round(region.metrics.beneficiaries * 0.25).toLocaleString()
      }))
    },
    {
      title: "Sustainability",
      value: totalMetrics.sustainability.toLocaleString(),
      label: "Number of planted trees",
      color: "bg-yellow-100",
      icon: <Leaf className="w-5 h-5 text-yellow-600" />,
      breakdown: metrics.map(region => ({
        label: region.region,
        value: Math.round(region.metrics.beneficiaries * 0.2).toLocaleString()
      }))
    },
    {
      title: "Social Impact",
      value: totalMetrics.social.toLocaleString(),
      label: "Number of people impacted",
      color: "bg-purple-100",
      icon: <Heart className="w-5 h-5 text-purple-600" />,
      breakdown: metrics.map(region => ({
        label: region.region,
        value: Math.round(region.metrics.beneficiaries * 0.15).toLocaleString()
      }))
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className={`p-6 ${metric.color}`}>
            <div className="flex items-center gap-2 mb-2">
              {metric.icon}
              <div>
                <h3 className="text-sm font-medium text-gray-900">{metric.title}</h3>
                <p className="text-xs text-gray-600">{metric.label}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              {metric.value}
            </p>
            <div className="space-y-1">
              {metric.breakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};