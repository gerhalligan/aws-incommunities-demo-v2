import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface DocumentationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocumentationSearch({ value, onChange }: DocumentationSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500" />
      <Input
        type="search"
        placeholder="Search documentation..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 bg-white/80 backdrop-blur-sm border-purple-100/20 focus:border-purple-300 focus:ring-purple-300"
      />
    </div>
  );
}