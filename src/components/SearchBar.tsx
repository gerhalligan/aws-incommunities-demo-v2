import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative mb-4" id="search-container">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search options..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary"
        id="search-input"
      />
    </div>
  );
};