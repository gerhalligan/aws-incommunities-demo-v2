import { QuizComponent } from "@/components/QuizComponent";
import { Layout } from "@/components/Layout";

const Index = () => {
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
                    AZ Data Entry Module
                  </h1>
                  <p className="text-lg text-white/90">
                    Complete this application to help us understand your infrastructure needs and requirements.
                  </p>
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