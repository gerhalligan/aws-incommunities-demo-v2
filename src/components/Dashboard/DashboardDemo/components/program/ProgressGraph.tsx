import { Progress } from "@/components/ui/progress";

interface ProgressGraphProps {
  value: string;
  goal: string;
  timePeriod: 'month' | 'quarter' | 'year';
}

export const ProgressGraph = ({ value, goal, timePeriod }: ProgressGraphProps) => {
  // Convert string values to numbers, handling monetary values
  const parseValue = (val: string) => {
    const numericValue = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    if (val.includes("M")) return numericValue * 1000000;
    if (val.includes("K")) return numericValue * 1000;
    return numericValue;
  };

  const currentValue = parseValue(value);
  const goalValue = parseValue(goal);
  const percentage = Math.min(Math.round((currentValue / goalValue) * 100), 100);

  return (
    <div className="w-full space-y-1">
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage}%</span>
        <span>Goal: {goal}</span>
      </div>
    </div>
  );
};