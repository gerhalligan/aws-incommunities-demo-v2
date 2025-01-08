import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow bg-primary">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=400" 
          alt="World Map"
          className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
      </div>

      <div className="relative p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Global Dashboard</h3>
            <p className="text-white/80 mb-4">
              Explore AWS community initiatives worldwide with our interactive map and real-time analytics.
            </p>
            <Button 
              variant="secondary" 
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/20 transition-colors"
              onClick={() => navigate("/dashboard/")}
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};