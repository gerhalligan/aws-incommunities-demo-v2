import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardList, Users, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/components/Dashboard/DashboardCard";
import { useView } from "@/contexts/ViewContext";

const Home = () => {
  const navigate = useNavigate();
  const { setCurrentView } = useView();

  const handleNewApplication = () => {
    localStorage.removeItem("application_id");
    // Clear any existing answers
    localStorage.removeItem("quiz_answers");
    setCurrentView("user");
    navigate("/questionnaire");
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative -mt-8">
        <div className="relative h-[600px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&h=600&q=80" 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                  AWS InCommunities Portal
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in [animation-delay:200ms]">
                  Empowering communities through infrastructure and innovation. Connect, collaborate, and create positive impact.
                </p>
                <div className="flex flex-wrap gap-4 animate-fade-in [animation-delay:400ms]">
                  <Button 
                    size="lg"
                    onClick={handleNewApplication}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    New Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/documentation")}
                    className="bg-transparent border-white text-white hover:bg-primary/10"
                  >
                    Learn More
                    <BookOpen className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                <ClipboardList className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Application</h3>
                  <p className="text-gray-600 mb-4">Complete infrastructure assessment application for new projects.</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleNewApplication}
                  >
                    New Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Profile Management</h3>
                  <p className="text-gray-600 mb-4">Update your profile information and manage account settings.</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/profile")}
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                  <p className="text-gray-600 mb-4">Access guides and documentation for using the portal effectively.</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/documentation")}
                  >
                    View Docs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Engagement Stakeholders </h3>
                  <p className="text-gray-600 mb-4">Get scores for different engagement stakeholders.</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/engagement-lookup")}
                  >
                    View Lookup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Dashboard Preview */}
          <div className="mb-12">
            <DashboardCard />
          </div>

          {/* Info Section */}
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-white">
            <h2 className="text-2xl font-semibold mb-4">About the Portal</h2>
            <p className="text-gray-600 mb-6">
              The AWS Community Engagement Portal streamlines the process of gathering and managing information about AWS infrastructure projects. 
              Use this platform to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Complete detailed questionnaires for new infrastructure projects</li>
              <li>Access AI-powered analysis of project locations and requirements</li>
              <li>Upload and manage project-related documentation</li>
              <li>Track project progress and maintain historical records</li>
            </ul>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Home;