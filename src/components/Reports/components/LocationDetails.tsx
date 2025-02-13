import { Card } from "@/components/ui/card";

interface LocationDetailsProps {
  location: string;
  locationType: string;
}

export const LocationDetails = ({ location, locationType }: LocationDetailsProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Location Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-700">Primary Location</h3>
              <p className="text-lg">{location || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Location Type</h3>
              <p className="text-lg">{locationType || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};