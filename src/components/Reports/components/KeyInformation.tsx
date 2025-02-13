import { Card } from "@/components/ui/card";

interface KeyInformationProps {
  region: string;
  cluster: string;
  infrastructureType: string;
}

export const KeyInformation = ({ region, cluster, infrastructureType }: KeyInformationProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6">
        <h3 className="font-semibold mb-2">Region</h3>
        <p className="text-2xl font-bold text-blue-600">{region || 'N/A'}</p>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-2">Cluster</h3>
        <p className="text-2xl font-bold text-blue-600">{cluster || 'N/A'}</p>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-2">Infrastructure Type</h3>
        <p className="text-2xl font-bold text-blue-600">{infrastructureType || 'N/A'}</p>
      </Card>
    </div>
  );
};