import { SubProgram } from "../../types/programs";
import { MetricItem } from "./MetricItem";

interface SubProgramSectionProps {
  subProgram: SubProgram;
  timePeriod: 'month' | 'quarter' | 'year';
}

export const SubProgramSection = ({ subProgram, timePeriod }: SubProgramSectionProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">{subProgram.name}</h4>
      <div className="space-y-3">
        {subProgram.metrics.map((metric) => (
          <MetricItem 
            key={metric.label}
            label={metric.label}
            value={metric.value}
            goal={metric.goal}
            details={metric.details}
            timePeriod={timePeriod}
          />
        ))}
      </div>
    </div>
  );
};