import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Save, History, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface HistoryEntry {
  stakeholder: string;
  location: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  score: number;
  timestamp: string;
}

// Stakeholder data
const stakeholderScores = {
  national: {
    "National Prime Minister/ President": 20,
    "National Government Minister": 15,
    "National Official": 12,
    "National Influencer": 10,
    "Nationally Important stakeholder": 10
  },
  regional: {
    "Regional Prime Minister/ President": 10,
    "Regional Government Minister": 8,
    "Regional Official": 6,
    "Regional Influencer": 5,
    "Regionally Important stakeholder": 5
  },
  local: {
    "Local Mayor": 10,
    "County Councillor": 8,
    "Local Official": 6,
    "Resident Association": 5,
    "Local Influencer": 4,
    "Locally Important stakeholder": 4
  }
};

const EngagementLookup = () => {
  const [showFields, setShowFields] = useState(false);
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>("all");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [stakeholderCategory, setStakeholderCategory] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('stakeholderHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
        toast.error('Failed to load history');
      }
    }
  }, []);

  // Get all stakeholders for the select
  const allStakeholders = Object.entries(stakeholderScores).flatMap(([category, stakeholders]) =>
    Object.entries(stakeholders).map(([stakeholder, score]) => ({
      category,
      name: stakeholder,
      score
    }))
  );

  const handleStakeholderSelect = (value: string) => {
    setSelectedStakeholder(value);
    setShowFields(value !== "all");
    setScore(null);
    setStakeholderCategory(null);
    
    // Find score for selected stakeholder
    if (value !== "all") {
      for (const [category, stakeholders] of Object.entries(stakeholderScores)) {
        if (value in stakeholders) {
          setScore(stakeholders[value]);
          setStakeholderCategory(category);
          break;
        }
      }
    }
  };

  const handleSaveEntry = () => {
    if (!location || !date || !score || !name || !email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEntry: HistoryEntry = {
      stakeholder: selectedStakeholder,
      location,
      name,
      email,
      phone,
      date,
      score,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('stakeholderHistory', JSON.stringify(updatedHistory));
    toast.success('Entry saved successfully');

    // Reset fields
    setLocation("");
    setDate("");
    setName("");
    setEmail("");
    setPhone("");
    setShowFields(false);
    setSelectedStakeholder("all");
    setScore(null);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('stakeholderHistory');
      toast.success('History cleared');
    }
  };

  const handleRemoveEntry = (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem('stakeholderHistory', JSON.stringify(updatedHistory));
    toast.success('Entry removed');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Engagement Stakeholders
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find engagement scores for stakeholders.
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto p-6 mb-8">
            <div className="space-y-6">
              <div className="space-y-4">
                  <Label>Stakeholder</Label>
                  <Select
                    value={selectedStakeholder}
                    onValueChange={handleStakeholderSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stakeholder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stakeholders</SelectItem>
                      {allStakeholders.map(({ name, score }) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {score !== null && stakeholderCategory && (
                    <Card className="p-4 mt-4 bg-white/50">
                      <h3 className="text-lg font-semibold text-primary mb-4">
                        {stakeholderCategory === 'national' ? 'National Level Stakeholders' :
                         stakeholderCategory === 'regional' ? 'Regional Level Stakeholders' :
                         'Local Level Stakeholders'}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{selectedStakeholder}</span>
                        <span className="text-primary font-bold">Score: {score}</span>
                      </div>
                      <Progress value={(score / 20) * 100} className="h-2 bg-gray-100" />
                    </Card>
                  )}
              </div>

              {showFields && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Details */}
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="font-medium text-gray-700">Contact Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="name"
                            placeholder="Enter name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="Enter phone..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location and Date */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="location"
                          placeholder="Enter location..."
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveEntry} 
                    className="w-full"
                    disabled={!location || !date || !name || !email}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Entry History</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear History
                </Button>
              </div>
              <Card className="divide-y">
                {history.map((entry, index) => (
                  <div 
                    key={index} 
                    className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">
                        {entry.stakeholder}
                        <span className="ml-2 text-sm text-gray-500">
                          ({entry.name})
                        </span>
                      </h3>
                      <div className="text-sm text-gray-500 space-x-2">
                        <span>{entry.location}</span>
                        <span>•</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>{entry.email}</span>
                        {entry.phone && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{entry.phone}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Added {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 relative">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Score:</span>
                        <span className="font-semibold text-primary">{entry.score}</span>
                      </div>
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(entry.score / 20) * 100}%` }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEntry(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EngagementLookup;