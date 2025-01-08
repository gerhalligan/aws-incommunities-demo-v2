import { useState } from "react";
import { ProgramCard } from "./program/ProgramCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { programs } from "../data/programs";

interface ProgramOverviewProps {
  selectedRegions?: Set<string>;
}

export const ProgramOverview = ({ selectedRegions }: ProgramOverviewProps) => {
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('year');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Program Overview</h2>
        <Select
          value={timePeriod}
          onValueChange={(value: 'month' | 'quarter' | 'year') => setTimePeriod(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program, index) => (
          <ProgramCard
            key={program.name}
            program={program}
            index={index}
            timePeriod={timePeriod}
          />
        ))}
      </div>
    </div>
  );
};