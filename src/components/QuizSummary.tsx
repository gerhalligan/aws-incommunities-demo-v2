import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, RefreshCcw, Check } from 'lucide-react';
import { Question } from '@/types/quiz';
import { generatePDF } from '@/services/pdf';
import { AnswerDisplay } from "./AnswerDisplay";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileMetadata } from '@/types/files';

interface SupabaseQuestionAnswer {
  id: string;
  user_id: string;
  question_id: number;
  answer: {
    value?: string;
    optionId?: string;
    aiAnalysis?: string;
    files?: FileMetadata[];
    formData?: Record<string, string>;
    buttonResponses?: Record<string, string>;
  };
  parent_repeater_id?: number;
  branch_entry_id?: string;
  branch_entry_index?: number;
  created_at: string;
  updated_at: string;
}

interface BranchableRepeaterProps {
  question: Question;
  questions: Question[];
  answers: Map<number, any[]>;
}

interface QuizSummaryProps {
  questions: Question[];
  onRestart: () => void;
}

/*******************************************************
 * Minimal Tabs / TabList / TabPanels / TabPanel 
 * Replace with your UI library of choice if desired
 *******************************************************/
function Tabs({ index, onChange, children }: any) {
  return <div>{children(onChange, index)}</div>;
}
function TabList({ children }: any) {
  return <div className="flex gap-2 border-b">{children}</div>;
}
function Tab({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 ${
        active ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
function TabPanels({ index, children }: any) {
  return <div>{children[index]}</div>;
}
function TabPanel({ children }: any) {
  return <div className="mt-3">{children}</div>;
}

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};


export const QuizSummary = ({ questions, onRestart }: QuizSummaryProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return;
        }

        // Fetch all answers for this user
        const { data, error } = await supabase
          .from('question_answers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching answers:", error);
          throw error;
        }

        // Create a new map with the answers, merging in branching info
        const answersMap = new Map();
        (data as unknown as SupabaseQuestionAnswer[])?.forEach((row) => {
          if (row?.answer) {
            const extendedAnswer = {
              ...row.answer,
              parent_repeater_id: row.parent_repeater_id,
              branch_entry_id: row.branch_entry_id,
              branch_entry_index: row.branch_entry_index
            };
            if (!answersMap.has(row.question_id)) {
              answersMap.set(row.question_id, []);
            }
            answersMap.get(row.question_id).push(extendedAnswer);
          }
        });

        console.log("Loaded answers:", Object.fromEntries(answersMap));
        setAnswers(answersMap);
      } catch (error) {
        console.error('Error loading answers:', error);
        toast.error('Failed to load answers');
      } finally {
        setIsLoading(false);
      }
    };

    if (questions.length > 0) {
      loadAnswers();
    }
  }, [questions]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(questions, answers);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Data Entry Module Completed
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button variant="outline" onClick={onRestart}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Render each question */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          const questionAnswer = answers.get(question.id);
          if (!questionAnswer) return null; // no answers at all, skip
        
          // Convert to array if it's a single object
          const allAnswers = Array.isArray(questionAnswer)
            ? questionAnswer
            : [questionAnswer];
        
          // Filter out child answers (those with parent_repeater_id set)
          const topLevelAnswers = allAnswers.filter((ans) => !ans.parent_repeater_id);
        
          // If there are no top-level answers...
          if (topLevelAnswers.length === 0) {
            // 1) If it's a NON-repeater, skip entirely
            // 2) If it's a repeater but NOT branchable, also skip
            // (Because you'd only show a repeater with zero top-level answers if it's branchable 
            //  and you want to show tab logic, or some other special case.)
            if (
              question.type !== "repeater" ||
              !question.repeaterConfig?.branchable
            ) {
              return null;
            }
          }
        
          return (
            <div
              key={question.id}
              className="border-b pb-4 last:border-b-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                <span className="text-gray-500 font-medium">{index + 1}.</span>
                <div className="flex-1">
                  {/* Only show the question heading if it’s either 
                      a top-level (non-branchable) question, 
                      or a branchable repeater (which needs the heading for the tab UI, etc.). */}
                  {(question.type !== "repeater" || question.repeaterConfig?.branchable) && (
                    <h3 className="font-medium text-gray-800 mb-2">
                      {question.question}
                    </h3>
                  )}
        
                  {/* Non-branchable or non-repeater => show top-level answers */}
                  {question.type !== "repeater" || !question.repeaterConfig?.branchable ? (
                    topLevelAnswers.map((ans, i) => (
                      <AnswerDisplay key={i} answer={ans} question={question} />
                    ))
                  ) : (
                    /* Repeater + branchable => show the tabbed interface */
                    <BranchableRepeater
                      question={question}
                      questions={questions}
                      answers={answers}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/**
 * Updated BranchableRepeater that:
 * 1) Looks up *all* parent answers (an array) for the question in the `answers` map.
 * 2) For each one, attempts to parse the repeater "entries" from its .value
 *    and merges them to display in the tabbed UI.
 * 3) Renders all child answers (again, each question could have multiple child answers).
 */
export function BranchableRepeater({
  question,
  questions,
  answers,
}: BranchableRepeaterProps) {
  const [activeTab, setActiveTab] = useState(0);

  // 1) Retrieve *all* parent answers for this question from the answers map.
  // If you replaced the single object with an array, answers.get(question.id) may be an array
  // or undefined. Handle both:
  const parentAnswers = answers.get(question.id) || [];

  // Ensure we always have an array (in case it's a single object).
  const parentAnswersArray = Array.isArray(parentAnswers)
    ? parentAnswers
    : [parentAnswers];

  // 2) Merge *all* "entries" from each parentAnswer.value
  let combinedEntries: any[] = [];

  parentAnswersArray.forEach((parentAns) => {
    if (parentAns && typeof parentAns.value === "string") {
      try {
        const parsed = JSON.parse(parentAns.value); // e.g. { entries: [...] }
        if (parsed.entries) {
          // Merge them into our combinedEntries array
          combinedEntries = combinedEntries.concat(parsed.entries);
        }
      } catch (err) {
        console.error("Error parsing repeater JSON", err);
      }
    }
  });

  // 3) Render each combined entry in a tab
  return (
    <Tabs index={activeTab} onChange={setActiveTab}>
      {(onChange, tabIndex) => (
        <>
          <TabList>
            {combinedEntries.map((entry: any, i: number) => {
              // We'll use the first field’s value (if any) for the tab label:
              const fieldIds = Object.keys(entry.values);
              let tabLabel = `Entry ${i + 1}`;
              if (fieldIds.length > 0) {
                const firstFieldId = fieldIds[0];
                const firstValue = entry.values[firstFieldId];
                if (
                  typeof firstValue === "string" &&
                  firstValue.trim().length > 0
                ) {
                  tabLabel = firstValue;
                }
              }

              return (
                <Tab
                  key={entry.id}
                  active={i === tabIndex}
                  onClick={() => onChange(i)}
                >
                  {tabLabel}
                </Tab>
              );
            })}
          </TabList>

          <TabPanels index={tabIndex}>
            {combinedEntries.map((entry: any, i: number) => (
              <TabPanel key={entry.id}>
                <div className="mt-2 space-y-2">
                  {/* Show this entry's fields */}
                  <div className="space-y-1">
                    {Object.entries(entry.values).map(([fieldId, value]) => {
                      const fieldDef = question.repeaterConfig?.fields.find(
                        (f) => f.id === fieldId
                      );
                      return (
                        <div key={fieldId} className="text-sm">
                          <span className="font-medium">
                            {fieldDef?.label}:
                          </span>{" "}
                          {formatValue(value)}
                        </div>
                      );
                    })}
                  </div>

                  {/* 4) Show child Q&A for this entry.
                      We look for *all answers* that match:
                       - parent_repeater_id === question.id
                       - branch_entry_id === entry.id
                  */}
                  {Array.from(answers.entries()).map(([childQId, childAnsArray]) => {
                    // childAnsArray might be either an array or a single object
                    const childAnswers = Array.isArray(childAnsArray)
                      ? childAnsArray
                      : [childAnsArray];

                    // Filter only the ones that belong under this entry
                    const childMatches = childAnswers.filter(
                      (childAns) =>
                        childAns.parent_repeater_id === question.id &&
                        childAns.branch_entry_id === entry.id
                    );

                    if (childMatches.length === 0) return null;

                    // For each matched child answer, find the child question, display it.
                    return childMatches.map((childAns, idx) => {
                      const childQ = questions.find((q) => q.id === childQId);
                      if (!childQ) return null;

                      return (
                        <div key={childQ.id + "-" + idx} className="mt-4 pl-4 border-l">
                          <h4 className="font-medium text-gray-700">
                            {childQ.question}
                          </h4>
                          <AnswerDisplay answer={childAns} question={childQ} />
                        </div>
                      );
                    });
                  })}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </>
      )}
    </Tabs>
  );
}