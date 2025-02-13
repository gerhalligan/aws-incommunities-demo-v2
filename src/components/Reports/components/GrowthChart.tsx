import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrowthData {
  year: string;
  capacity: number;
}

interface GrowthChartProps {
  data: GrowthData[];
}

export const GrowthChart = ({ data }: GrowthChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Capacity Growth Projection</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="capacity" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};