import { useState } from "react";
import { Question } from "@/types/quiz";
import { GripVertical, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface QuestionItemProps {
  question: Question;
  isActive: boolean;
  onClick: () => void;
  id: number;
  onDelete: () => void;
}

const SortableQuestionItem = ({ question, isActive, onClick, id, onDelete }: QuestionItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 group",
        isActive && "bg-primary/10"
      )}
    >
      <button
        className="cursor-grab hover:bg-gray-200 p-1 rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div onClick={onClick} className="flex-1 cursor-pointer">
        {question.question} (ID:{question.id})
      </div>
       <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
};

interface QuestionListProps {
  questions: Question[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  onQuestionsReorder: (questions: Question[]) => void;
}

export const QuestionList = ({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
  onQuestionsReorder,
}: QuestionListProps) => {

   const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [dependencies, setDependencies] = useState<Array<{
    dependent_id: number;
    dependent_question: string;
    dependency_type: string;
  }>>([]);

  const handleDeleteQuestion = async (question: Question) => {
    try {
      // Check for dependencies
      const { data: deps, error: depsError } = await supabase
        .rpc('check_question_dependencies', { question_id: question.id });

      if (depsError) throw depsError;

      if (deps && deps.length > 0) {
        setDependencies(deps);
      }

      setQuestionToDelete(question);
    } catch (error) {
      console.error('Error checking dependencies:', error);
      toast.error('Failed to check question dependencies');
    }
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      const { error } = await supabase
        .rpc('delete_question', { question_id: questionToDelete.id });

      if (error) throw error;

      // Update local state
      const newQuestions = questions.filter(q => q.id !== questionToDelete.id);
      onQuestionsReorder(newQuestions);
      
      if (currentQuestionIndex >= newQuestions.length) {
        onQuestionSelect(Math.max(0, newQuestions.length - 1));
      }

      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setQuestionToDelete(null);
      setDependencies([]);
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

const handleDragEnd = async (event) => {
  console.log('handleDragEnd - Event:', { active: event.active, over: event.over });

  const { active, over } = event;

  if (active.id !== over.id) {
    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);
    console.log('Question indices:', { oldIndex, newIndex });
    console.log('Questions being reordered:', {
      moved: questions[oldIndex],
      target: questions[newIndex]
    });

    // Check for dependencies
    const movedQuestion = questions[oldIndex];
    const hasDependencies = questions.some(q => 
      q.dependsOn?.some(dep => dep.questionId === movedQuestion.id) ||
      q.options.some(opt => opt.nextQuestionId === movedQuestion.id)
    );
    console.log('Dependencies check:', { hasDependencies });

    if (hasDependencies) {
      toast.warning(
        "This question has dependencies. Moving it might affect the quiz flow.",
        {
          action: {
            label: "Move Anyway",
            onClick: async () => {
              try {
                console.log('Updating question order with dependencies:', {
                  questionId: active.id,
                  newOrder: newIndex + 1
                });

                // Use temporary placeholders for question_order
                for (let i = 0; i < questions.length; i++) {
                  const tempOrder = -1 * (i + 1);
                  const { error: tempError } = await supabase
                    .from('questions')
                    .update({ question_order: tempOrder })
                    .eq('id', questions[i].id);
                  if (tempError) throw tempError;
                }

                // Reassign final order
                const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
                for (let i = 0; i < reorderedQuestions.length; i++) {
                  const finalOrder = i + 1;
                  const { error: finalError } = await supabase
                    .from('questions')
                    .update({ question_order: finalOrder })
                    .eq('id', reorderedQuestions[i].id);
                  if (finalError) throw finalError;
                }

                console.log('Reordered questions with dependencies:', reorderedQuestions);
                onQuestionsReorder(reorderedQuestions);
              } catch (error) {
                console.error('Error reordering question with dependencies:', error);
                toast.error('Failed to reorder question');
              }
            },
          },
        }
      );
      return;
    }

    // If no dependencies, proceed with reordering
    try {
      console.log('Updating question order:', {
        questionId: active.id,
        newOrder: newIndex + 1
      });

      // Use temporary placeholders for question_order
      for (let i = 0; i < questions.length; i++) {
        const tempOrder = -1 * (i + 1);
        const { error: tempError } = await supabase
          .from('questions')
          .update({ question_order: tempOrder })
          .eq('id', questions[i].id);
        if (tempError) throw tempError;
      }

      // Reassign final order
      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      for (let i = 0; i < reorderedQuestions.length; i++) {
        const finalOrder = i + 1;
        const { error: finalError } = await supabase
          .from('questions')
          .update({ question_order: finalOrder })
          .eq('id', reorderedQuestions[i].id);
        if (finalError) throw finalError;
      }

      console.log('Reordered questions:', reorderedQuestions);
      onQuestionsReorder(reorderedQuestions);
    } catch (error) {
      console.error('Error reordering question:', error);
      toast.error('Failed to reorder question');
    }
  }
};

 const handleAddQuestion = async () => {
  try {
    // Get the maximum order value from existing questions
    const { data: existingQuestions, error: queryError } = await supabase
      .from('questions')
      .select('question_order')
      .order('question_order', { ascending: false })
      .limit(1);

    if (queryError) throw queryError;

    const maxOrder = existingQuestions?.[0]?.question_order || 0;
    const newOrder = maxOrder + 1;
    const newId = Math.max(0, ...questions.map(q => q.id)) + 1;

    // Create new question
    const newQuestion: Question = {
      id: newId,
      question: "New Question",
      type: "multiple-choice",
      options: [],
      question_order: newOrder,
      file_upload_metadata: {
        enabled: false,
        required: false,
        maxFiles: 1,
        fileLabels: ["Upload File"],
        fileRequirements: [false]
      },
      ai_lookup: {
        enabled: false,
        prompt: ""
      }
    };

    // Insert new question
    const { error: insertError } = await supabase
      .from('questions')
      .insert([{
        id: newId,
        question: "New Question",
        type: "multiple-choice",
        options: [],
        question_order: newOrder,
        file_upload_metadata: newQuestion.file_upload_metadata,
        ai_lookup: newQuestion.ai_lookup,
        default_next_question_id: null
      }]);

    if (insertError) throw insertError;

    // Update local state
    onQuestionsReorder([...questions, newQuestion]);
    onQuestionSelect(questions.length);
    toast.success("New question added");
  } catch (error) {
    console.error('Error adding question:', error);
    toast.error('Failed to add question');
  }
};

  // In QuestionList.tsx
  if (!questions?.length) {
    return null;
  }

  return (
    <div className="w-64 bg-white p-4 border-r border-gray-200 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Questions</h3>
        <Button
          onClick={handleAddQuestion}
          size="sm"
          className="h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions.map(q => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {[...questions]
              .sort((a, b) => (a.question_order || 0) - (b.question_order || 0))
              .map((question, index) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                isActive={index === currentQuestionIndex}
                onClick={() => onQuestionSelect(index)}
                id={question.id}
                onDelete={() => handleDeleteQuestion(question)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <AlertDialog 
        open={!!questionToDelete}
        onOpenChange={() => {
          setQuestionToDelete(null);
          setDependencies([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              {dependencies.length > 0 ? (
                <>
                  <p className="mb-2 text-red-500">Warning: This question has dependencies:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {dependencies.map((dep, index) => (
                      <li key={index}>
                        "{dep.dependent_question}" ({dep.dependency_type})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">Deleting this question will break these dependencies.</p>
                </>
              ) : (
                "Are you sure you want to delete this question? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
