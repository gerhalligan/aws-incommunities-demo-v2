import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Globe, MapPin, Check } from "lucide-react";

type Region = {
  name: string;
  code: string;
  type: "existing" | "ml" | "expansion" | "prospective";
};

const regions = {
  AMER: {
    existing: [
      { name: "Northern Virginia", code: "IAD" },
      { name: "Portland, Oregon", code: "PDX" },
      { name: "Columbus, Ohio", code: "CMH" },
      { name: "San Francisco, California", code: "SFO" },
      { name: "Phoenix, Arizona", code: "PHX" },
      { name: "São Paulo, Brazil", code: "GRU" },
      { name: "Querétaro, Mexico", code: "QRO" },
      { name: "Santiago, Chile", code: "SCL" },
      { name: "Montreal, Canada", code: "YUL" },
      { name: "Calgary, Canada", code: "YYC" },
    ],
    ml: [
      { name: "Atlanta, Georgia", code: "ATL" },
      { name: "Jackson, Mississippi", code: "JAN" },
      { name: "South Bend, Indiana", code: "SBN" },
      { name: "Philadelphia, Pennsylvania", code: "PHL" },
      { name: "Minneapolis, Minnesota", code: "MSP" },
    ],
    expansion: [{ name: "Project Holiday", code: "HOLIDAY" }],
    prospective: [
      { name: "Prospective 1", code: "PROS1" },
      { name: "Prospective 2", code: "PROS2" },
    ],
  },
  EMEA: {
    existing: [
      { name: "Stockholm, Sweden", code: "ARN" },
      { name: "Bahrain", code: "BAH" },
      { name: "Paris, France", code: "CDG" },
      { name: "Cape Town, South Africa", code: "CPT" },
      { name: "Dublin, Ireland", code: "DUB" },
      { name: "Dubai, UAE", code: "DXB" },
      { name: "Frankfurt, Germany", code: "FRA" },
      { name: "London, United Kingdom", code: "LHR" },
      { name: "Milan, Italy", code: "MXP" },
      { name: "Tel Aviv, Israel", code: "TLV" },
      { name: "Zaragoza, Spain", code: "ZAZ" },
      { name: "Zurich, Switzerland", code: "ZRH" },
    ],
    ml: [{ name: "Minneapolis, Minnesota", code: "MSP" }],
    expansion: [{ name: "Project Holiday", code: "HOLIDAY" }],
    prospective: [
      { name: "Prospective 1", code: "PROS1" },
      { name: "Prospective 2", code: "PROS2" },
    ],
  },
  APJC: {
    existing: [
      { name: "Tokyo, Japan", code: "NRT" },
      { name: "Osaka, Japan", code: "KIX" },
      { name: "Jakarta, Indonesia", code: "CGK" },
      { name: "Singapore", code: "SIN" },
      { name: "Bangkok, Thailand", code: "BKK" },
      { name: "Kuala Lumpur, Malaysia", code: "KUL" },
      { name: "Beijing, China", code: "BJS" },
      { name: "Zhengzhou, China", code: "ZHY" },
      { name: "Hong Kong", code: "HKG" },
      { name: "Taipei, Taiwan", code: "TPE" },
      { name: "Auckland, New Zealand", code: "AKL" },
      { name: "Melbourne, Australia", code: "MEL" },
      { name: "Sydney, Australia", code: "SYD" },
      { name: "Seoul, South Korea", code: "ICN" },
      { name: "Mumbai, India", code: "BOM" },
      { name: "Hyderabad, India", code: "HYD" },
    ],
    ml: [{ name: "Minneapolis, Minnesota", code: "MSP" }],
    expansion: [{ name: "Project Holiday", code: "HOLIDAY" }],
    prospective: [{ name: "Prospective 1", code: "PROS1" }],
  },
};

export type SelectedRegions = {
  [key: string]: {
    [key: string]: boolean;
  };
};

interface RegionsSidebarProps {
  selectedRegions: SelectedRegions;
  onRegionToggle: (region: string, type: string, value: boolean) => void;
}

export const RegionsSidebar = ({
  selectedRegions,
  onRegionToggle,
}: RegionsSidebarProps) => {
  const getSelectedCount = (regionName: string, type: string) => {
    const regions = selectedRegions[regionName]?.[type];
    return regions ? 1 : 0;
  };

  return (
    <Sidebar>
      <SidebarContent>
        {Object.entries(regions).map(([regionName, regionTypes]) => (
          <SidebarGroup key={regionName}>
            <SidebarGroupLabel>
              <Globe className="mr-2" />
              {regionName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(regionTypes).map(([type, locations]) => (
                  <SidebarMenuItem key={`${regionName}-${type}`}>
                    <SidebarMenuButton
                      onClick={() =>
                        onRegionToggle(
                          regionName,
                          type,
                          !selectedRegions[regionName]?.[type]
                        )
                      }
                      className={`flex items-center justify-between w-full ${
                        selectedRegions[regionName]?.[type]
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <MapPin className="mr-2" />
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedRegions[regionName]?.[type] && (
                          <Check className="w-4 h-4" />
                        )}
                        <span className="text-xs">
                          ({locations.length})
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};