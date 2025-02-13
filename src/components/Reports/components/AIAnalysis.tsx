import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';

interface AIAnalysisProps {
  buttonResponses: Record<string, string>;
  buttonTextMap: Record<string, string>;
}

export const AIAnalysis = ({ buttonResponses, buttonTextMap }: AIAnalysisProps) => {
  if (!buttonResponses) return null;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">AI Analysis</h2>
      <Accordion type="single" collapsible className="space-y-4">
        {Object.entries(buttonTextMap).map(([buttonId, buttonText]) => {
          const response = buttonResponses[buttonId];
          if (!response) return null;

          return (
            <AccordionItem key={buttonId} value={buttonId} className="border rounded-lg px-4">
              <AccordionTrigger className="py-4">
                <div className="flex flex-col items-start">
                  <h3 className="text-lg font-semibold">{buttonText}</h3>
                  <p className="text-sm text-gray-600 font-normal text-left">
                    {response.split('\n')[0].slice(0, 150) + '...'}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none pb-4 dark:prose-invert">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Card>
  );
};