import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';

interface Authority {
  id: string;
  values: {
    [key: string]: string;
  };
}

interface AuthoritiesSectionProps {
  authorities: Authority[];
  aiAnalysis?: string;
}

export const AuthoritiesSection = ({ authorities, aiAnalysis }: AuthoritiesSectionProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Authorities and Jurisdiction</h2>
      <div className="space-y-4">
        <Accordion type="single" collapsible className="space-y-4">
          {authorities.map((authority) => (
            <AccordionItem 
              key={authority.id} 
              value={authority.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="py-4">
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col items-start">
                    <h3 className="font-semibold">{authority.values['220132e5-55eb-47d2-a9a3-fadfdb33bab5']}</h3>
                    <p className="text-sm text-gray-600">{authority.values['ec8641c1-d79b-4894-9d86-a1ca97de0e53']} Authority</p>
                  </div>
                  <Badge variant={authority.id === '891331d6-5d70-4034-8725-959606d165e9' ? 'default' : 'outline'}>
                    {authority.id === '891331d6-5d70-4034-8725-959606d165e9' ? 'Primary AHJ' : 'Secondary AHJ'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {aiAnalysis && (
                  <div className="prose prose-sm max-w-none pb-4 dark:prose-invert">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
};