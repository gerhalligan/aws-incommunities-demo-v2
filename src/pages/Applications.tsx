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
import { FileText, Plus, Search, Calendar, MapPin, Trash2 } from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Application {
  id: string;
  application_id: string;
  created_at: string;
  region: string;
  cluster: string;
  infrastructure_type: string;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const navigate = useNavigate();
  const { setCurrentView } = useView();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all answers for the first three questions (Region, Cluster, Infrastructure Type)
      const { data: answers, error } = await supabase
        .from('question_answers')
        .select('application_id, created_at, answer, question_id')
        .eq('user_id', user.id)
        .in('question_id', [1, 2, 3]) // Region, Cluster, Infrastructure Type
        .is('parent_repeater_id', null)
        .is('branch_entry_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group answers by created_at timestamp
      const groupedAnswers = answers.reduce((acc, answer: any) => {
        const appId = answer.application_id;
        if (!acc[appId]) {
          acc[appId] = {
            id: answer.application_id,
            application_id: answer.application_id,
            created_at: answer.created_at,
            region: '',
            cluster: '',
            infrastructure_type: ''
          };
        }
        
        // Map question_id to the corresponding field
        switch (answer.question_id) {
          case 1: // Region
            acc[appId].region = answer.answer.value || answer.answer.text || 'N/A';
            break;
          case 2: // Cluster
            acc[appId].cluster = answer.answer.value || answer.answer.text || 'N/A';
            break;
          case 3: // Infrastructure Type
            acc[appId].infrastructure_type = answer.answer.value || answer.answer.text || 'N/A';
            break;
        }
        return acc;
      }, {});

      // Convert grouped answers to array
      const applications = Object.values(groupedAnswers);

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
    localStorage.setItem('application_id', applicationId);
    navigate('/questionnaire');
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all answers with the same application_id
      const { error } = await supabase
        .from('question_answers')
        .delete()
        .eq('user_id', user.id)
        .eq('application_id', applicationToDelete.application_id);

      if (error) throw error;

      // Update local state
      setApplications(apps => apps.filter(app => app.application_id !== applicationToDelete.application_id));
      toast.success("Application deleted successfully");
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error("Failed to delete application");
    } finally {
      setApplicationToDelete(null);
    }
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
                localStorage.removeItem("application_id");
                // Clear any existing answers
                localStorage.removeItem("quiz_answers");
                // Clear the completed state
                localStorage.removeItem("force_quiz_complete");
                setCurrentView("user");
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplication(app.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setApplicationToDelete(app)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!applicationToDelete} onOpenChange={() => setApplicationToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this application? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteApplication}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Applications;