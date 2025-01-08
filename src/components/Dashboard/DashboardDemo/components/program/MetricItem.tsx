import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { adjustValueForTimePeriod } from "../../utils/timeAdjustments";

interface MetricItemProps {
  label: string;
  value: string;
  goal: string;
  details?: string[];
  timePeriod: 'month' | 'quarter' | 'year';
}

export const MetricItem = ({ label, value, goal, details, timePeriod }: MetricItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Adjust both value and goal based on time period
  const adjustedValue = adjustValueForTimePeriod(value, timePeriod);
  const adjustedGoal = adjustValueForTimePeriod(goal, timePeriod);
  
  const numericValue = adjustedValue ? Number(adjustedValue.replace(/[^0-9.-]+/g, "")) : 0;
  const numericGoal = adjustedGoal ? Number(adjustedGoal.replace(/[^0-9.-]+/g, "")) : 1;
  const progress = (numericValue / numericGoal) * 100;

  return (
     <div className="space-y-2">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col space-y-2 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
      >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{label}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-sm text-gray-600">
                    {adjustedValue} / {adjustedGoal}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current value: {adjustedValue}</p>
                  <p>Goal: {adjustedGoal}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      
      {details && details.length > 0 && (
        <div className={isOpen ? "block" : "hidden"}>
          <div className="pl-4 pt-2 space-y-1">
            {details.map((detail, index) => (
              <p key={index} className="text-sm text-gray-600">{detail}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};