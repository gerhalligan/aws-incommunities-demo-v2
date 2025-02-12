import { useEffect, useState } from "react";
import { QuizComponent } from "@/components/QuizComponent";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Index = () => {
  const [applicationDate, setApplicationDate] = useState<string | null>(null);
  const selectedApplicationId = localStorage.getItem('application_id');

  useEffect(() => {
    const loadApplicationDate = async () => {
      if (!selectedApplicationId) return;

      const { data, error } = await supabase
        .from('question_answers')
        .select('created_at')
        .eq('application_id', selectedApplicationId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading application date:', error);
        return;
      }

      if (data) {
        setApplicationDate(format(new Date(data.created_at), 'MMMM d, yyyy'));
      }
    };

    loadApplicationDate();
  }, [selectedApplicationId]);

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <div className="relative">
          <div className="h-[300px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&h=600&q=80" 
              alt="Infrastructure Assessment" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {selectedApplicationId ? 'View Application' : 'New Application'}
                  </h1>
                  {applicationDate ? (
                    <p className="text-lg text-white/90">
                      Submitted on {applicationDate}
                    </p>
                  ) : (
                    <p className="text-lg text-white/90">
                      Complete this application to help us understand your infrastructure needs and requirements.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quiz Component */}
        <div className="container mx-auto px-4 -mt-16 relative z-10 pb-8">
          <QuizComponent />
        </div>
      </div>
    </Layout>
  );
};

export default Index;