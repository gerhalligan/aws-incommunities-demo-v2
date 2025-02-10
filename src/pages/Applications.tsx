import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus, Search, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  created_at: string;
  region: string;
  cluster: string;
  infrastructure_type: string;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all unique application IDs based on first question (Region)
      const { data: answers, error } = await supabase
        .from('question_answers')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', 1) // Region question
        .is('parent_repeater_id', null)
        .is('branch_entry_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each application, get the key answers
      const applications = await Promise.all(
        answers.map(async (answer) => {
          // Get cluster name (Q2) and infrastructure type (Q3) for this application
          const { data: relatedAnswers } = await supabase
            .from('question_answers')
            .select('*')
            .eq('user_id', user.id)
            .in('question_id', [2, 3]) // Cluster and Infrastructure Type
            .eq('created_at', answer.created_at)
            .is('parent_repeater_id', null)
            .is('branch_entry_id', null);

          const clusterAnswer = relatedAnswers?.find(a => a.question_id === 2);
          const infraAnswer = relatedAnswers?.find(a => a.question_id === 3);

          return {
            id: answer.id,
            created_at: answer.created_at,
            region: answer.answer.value || answer.answer.text || 'N/A',
            cluster: clusterAnswer?.answer.value || clusterAnswer?.answer.text || 'N/A',
            infrastructure_type: infraAnswer?.answer.value || infraAnswer?.answer.text || 'N/A'
          };
        })
      );

      setApplications(applications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    app.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.cluster.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.infrastructure_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewApplication = (applicationId: string) => {
    // Store the application ID in localStorage
    localStorage.setItem('selected_application_id', applicationId);
    navigate('/questionnaire');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
              <p className="text-gray-600 mt-2">
                View and manage your infrastructure assessment applications
              </p>
            </div>
            <Button 
              onClick={() => {
                localStorage.removeItem('selected_application_id');
                navigate('/questionnaire');
              }}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>

          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Infrastructure Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id} className="group hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(app.created_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {app.region}
                          </div>
                        </TableCell>
                        <TableCell>{app.cluster}</TableCell>
                        <TableCell>{app.infrastructure_type}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(app.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "No applications match your search criteria"
                    : "Start by creating your first application"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Applications;