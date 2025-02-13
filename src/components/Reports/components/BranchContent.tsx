import { LocationDetails } from './LocationDetails';
import { GrowthChart } from './GrowthChart';
import { AIAnalysis } from './AIAnalysis';
import { AuthoritiesSection } from './AuthoritiesSection';

interface BranchContentProps {
  branchAnswers: any[];
  buttonTextMap: Record<string, string>;
  getAnswerByQuestionId: (id: number) => any;
}

export const BranchContent = ({ branchAnswers, buttonTextMap, getAnswerByQuestionId }: BranchContentProps) => {
  const locationAnswer = branchAnswers.find(a => a.question_id === 6);
  const growthAnswer = branchAnswers.find(a => a.question_id === 17);
  const authoritiesAnswer = branchAnswers.find(a => a.question_id === 8);

  // Parse growth data
  const growthData = (() => {
    if (!growthAnswer) return [];
    try {
      const parsed = JSON.parse(growthAnswer.answer.value);
      const entry = parsed.entries[0];
      const yearMapping = {
        '34538b46-fd30-4398-9dbf-5e3fbb68ce78': 'Year 1',
        'c3d1f976-1435-4268-9277-170eae1a560f': 'Year 2',
        'ac418ddb-4a2e-4e42-b690-9f92ef9ba2e3': 'Year 3',
        '47c9946e-c744-4781-8bbb-c97ee774f99e': 'Year 4',
        '2bdebd73-d0db-4585-a03c-9b272e84b72c': 'Year 5'
      };
      
      return Object.entries(yearMapping)
        .filter(([key]) => entry.values[key])
        .map(([key, yearLabel]) => ({
          year: yearLabel,
          capacity: Number(entry.values[key])
        }));
    } catch (e) {
      console.error('Error parsing growth data:', e);
      return [];
    }
  })();

  // Parse authorities data
  const authorities = (() => {
    try {
      return JSON.parse(getAnswerByQuestionId(9)?.answer.value || '{"entries": []}').entries;
    } catch (e) {
      console.error('Error parsing authorities:', e);
      return [];
    }
  })();

  return (
    <div className="space-y-8">
      <LocationDetails
        location={locationAnswer?.answer.value}
        locationType={branchAnswers.find(a => a.question_id === 7)?.answer.value}
      />

      <GrowthChart data={growthData} />

      {locationAnswer?.answer.aiAnalysis?.buttonResponses && (
        <AIAnalysis
          buttonResponses={locationAnswer.answer.aiAnalysis.buttonResponses}
          buttonTextMap={buttonTextMap}
        />
      )}

      <AuthoritiesSection
        authorities={authorities}
        aiAnalysis={authoritiesAnswer?.answer.aiAnalysis?.analysis}
      />
    </div>
  );
};