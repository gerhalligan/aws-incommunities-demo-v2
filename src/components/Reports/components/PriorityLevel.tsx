import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PriorityLevelProps {
  priority: string;
}

export const PriorityLevel = ({ priority }: PriorityLevelProps) => {
  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Priority Level</h2>
      <Badge variant="secondary" className="text-lg text-white">
        {priority || 'N/A'}
      </Badge>
    </Card>
  );
};