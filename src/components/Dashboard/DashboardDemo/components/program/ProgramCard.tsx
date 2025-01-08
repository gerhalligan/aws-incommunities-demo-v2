import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Program } from "../../types/programs";
import { adjustValueForTimePeriod } from "../../utils/timeAdjustments";
import { SubProgramSection } from "./SubProgramSection";
import { 
  Beaker, 
  GraduationCap, 
  Leaf, 
  HeartHandshake, 
  Users, 
  BarChart3 
} from "lucide-react";

interface ProgramCardProps {
  program: Program;
  index: number;
  timePeriod: 'month' | 'quarter' | 'year';
}

const getProgramIcon = (programName: string) => {
  switch (programName) {
    case "STEAM":
      return <Beaker className="w-6 h-6 text-blue-600" />;
    case "Local Skills Development":
      return <GraduationCap className="w-6 h-6 text-cyan-600" />;
    case "Sustainability":
      return <Leaf className="w-6 h-6 text-green-600" />;
    case "Hyperlocal":
      return <HeartHandshake className="w-6 h-6 text-purple-600" />;
    case "Volunteering":
      return <Users className="w-6 h-6 text-orange-600" />;
    case "Sentiment & Social Impact":
      return <BarChart3 className="w-6 h-6 text-indigo-600" />;
    default:
      return null;
  }
};

export const ProgramCard = ({ program, index, timePeriod }: ProgramCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="glass-card p-6 card-hover">
        <div className="space-y-4">
          <div className="border-b pb-2">
            <div className="flex items-center gap-2 mb-2">
              {getProgramIcon(program.name)}
              <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
            </div>
            <p className="text-sm text-gray-500">
              Investment: {adjustValueForTimePeriod(program.ytdInvestment, timePeriod)}
            </p>
          </div>
          <div className="space-y-6">
            {program.subPrograms.map((subProgram) => (
              <Card key={subProgram.name} className="glass-card bg-white/40 p-4 transition-all duration-300 hover:bg-white/60">
                <SubProgramSection
                  subProgram={subProgram}
                  timePeriod={timePeriod}
                />
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};