import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  isExporting: boolean;
}

export const ExportButton = ({ onClick, isExporting }: ExportButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isExporting}
      className="mt-4"
      variant="outline"
    >
      <Download className="w-4 h-4 mr-2" />
      {isExporting ? "Exporting..." : "Export Report"}
    </Button>
  );
};