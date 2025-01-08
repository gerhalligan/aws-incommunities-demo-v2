import { Check, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Region, RegionGroup } from "../types/regions";

interface RegionsFilterProps {
  onRegionSelect: (regions: Set<string>) => void;
  selectedRegions: Set<string>;
}

const regionGroups: RegionGroup[] = [
  {
    name: "AMER - Existing Regions",
    regions: [
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
  },
  {
    name: "AMER - ML Regions",
    regions: [
      { name: "Atlanta, Georgia", code: "ATL" },
      { name: "Jackson, Mississippi", code: "JAN" },
      { name: "South Bend, Indiana", code: "SBN" },
      { name: "Philadelphia, Pennsylvania", code: "PHL" },
      { name: "Minneapolis, Minnesota", code: "MSP" },
    ],
  },
  {
    name: "EMEA - Existing Regions",
    regions: [
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
  },
  {
    name: "APJC - Existing Regions",
    regions: [
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
  },
];

export const RegionsFilter = ({ onRegionSelect, selectedRegions }: RegionsFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleRegionToggle = (code: string, groupName: string) => {
    const newSelected = new Set(selectedRegions);
    
    // If toggling a group
    const group = regionGroups.find((g) => g.name === groupName);
    if (code === groupName && group) {
      const isGroupSelected = isGroupFullySelected(groupName);
      
      // Toggle all regions in the group
      group.regions.forEach((region) => {
        if (isGroupSelected) {
          newSelected.delete(region.code);
        } else {
          newSelected.add(region.code);
        }
      });
    } else {
      // Toggle individual region
      if (newSelected.has(code)) {
        newSelected.delete(code);
      } else {
        newSelected.add(code);
      }
    }
    
    onRegionSelect(newSelected);
  };

  const handleSelectAll = () => {
    const allRegions = new Set(
      regionGroups.flatMap((group) => group.regions.map((r) => r.code))
    );
    onRegionSelect(allRegions);
  };

  const handleDeselectAll = () => {
    onRegionSelect(new Set());
  };

  const isGroupFullySelected = (groupName: string) => {
    const group = regionGroups.find((g) => g.name === groupName);
    if (!group) return false;
    return group.regions.every((region) => selectedRegions.has(region.code));
  };

  const isGroupPartiallySelected = (groupName: string) => {
    const group = regionGroups.find((g) => g.name === groupName);
    if (!group) return false;
    const selectedInGroup = group.regions.some((region) => selectedRegions.has(region.code));
    return selectedInGroup && !isGroupFullySelected(groupName);
  };

  const filteredRegionGroups = regionGroups.map((group) => ({
    ...group,
    regions: group.regions.filter(
      (region) =>
        region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <span>Filter by Region</span>
          <MapPin className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] max-h-[500px] overflow-y-auto">
        <div className="p-2">
          <Input
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
        </div>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>All Regions</span>
          <div className="space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleDeselectAll}
            >
              Deselect All
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredRegionGroups.map((group) => (
          <div key={group.name}>
            <DropdownMenuCheckboxItem
              checked={isGroupFullySelected(group.name)}
              onCheckedChange={() => handleRegionToggle(group.name, group.name)}
              className="font-semibold"
            >
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{group.name}</span>
              </div>
            </DropdownMenuCheckboxItem>
            {group.regions.map((region) => (
              <DropdownMenuCheckboxItem
                key={region.code}
                checked={selectedRegions.has(region.code)}
                onCheckedChange={() => handleRegionToggle(region.code, group.name)}
                className="pl-6"
              >
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>
                    {region.code} - {region.name}
                  </span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};