import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import { useState } from "react";

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
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<Array<{
    category: string;
    stakeholder: string;
    score: number;
  }> | null>(null);

  // Get all stakeholders for the select
  const allStakeholders = Object.entries(stakeholderScores).flatMap(([category, stakeholders]) =>
    Object.entries(stakeholders).map(([stakeholder, score]) => ({
      category,
      name: stakeholder,
      score
    }))
  );

  const handleSearch = () => {
    if (!location) return;

    const results = [];
    for (const [category, stakeholders] of Object.entries(stakeholderScores)) {
      for (const [stakeholder, score] of Object.entries(stakeholders)) {
        // Filter by selected stakeholder if one is selected
        if (selectedStakeholder !== "all" && stakeholder !== selectedStakeholder) continue;
        
        results.push({
          category,
          stakeholder,
          score: score as number
        });
      }
    }

    setSearchResults(results);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Engagement Stakeholders Lookup
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find engagement scores for stakeholders based on location and date
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto p-6 mb-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <Label htmlFor="year">Year</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="year"
                      type="number"
                      min="2000"
                      max="2100"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="pl-10"
                      placeholder="Enter year..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Stakeholder</Label>
                  <Select
                    value={selectedStakeholder}
                    onValueChange={setSelectedStakeholder}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stakeholder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stakeholders</SelectItem>
                      {allStakeholders.map(({ name, score }) => (
                        <SelectItem key={name} value={name}>
                          {name} (Score: {score})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                className="w-full"
                disabled={!location || !year || year.length !== 4}
              >
                <Search className="w-4 h-4 mr-2" />
                Search Stakeholders
              </Button>
            </div>
          </Card>

          {/* Results */}
          {searchResults && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6">Stakeholder Scores</h2>
              <div className="grid gap-6">
                {Object.keys(stakeholderScores).map((category) => {
                  const filteredResults = searchResults
                    .filter((result) => result.category === category)
                    .filter((result) => selectedStakeholder === "all" || result.stakeholder === selectedStakeholder);
                  
                  // Skip rendering if no results for this category
                  if (filteredResults.length === 0) return null;
                  
                  return (
                  <Card key={category} className="p-6">
                    <h3 className="text-lg font-semibold capitalize mb-4 text-primary">
                      {category} Level Stakeholders
                    </h3>
                    <div className="space-y-4">
                      {filteredResults
                        .map((result) => (
                          <div 
                            key={result.stakeholder}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <span className="text-gray-700">{result.stakeholder}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Score:</span>
                                <span className="font-semibold text-primary">{result.score}</span>
                              </div>
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${(result.score / 20) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EngagementLookup;