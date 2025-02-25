import { useState, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Info, Save, Copy, Plus, Trash } from "lucide-react";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import type { AILookupButton } from "@/types/quiz";

interface AIPromptEditorProps {
  question: any;
  onUpdate: (updates: any) => void;
}

export const AIPromptEditor = ({ question, onUpdate }: AIPromptEditorProps) => {
  const [isEnabled, setIsEnabled] = useState(!!question.aiLookup?.enabled);
  const [promptValue, setPromptValue] = useState(question.aiLookup?.prompt || "");
  const [buttons, setButtons] = useState(question.aiLookup?.buttons || []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local state when question changes
  useEffect(() => {
    setIsEnabled(!!question.aiLookup?.enabled);
    setPromptValue(question.aiLookup?.prompt || "");
    setButtons(question.aiLookup?.buttons || []);
  }, [question.id, question.aiLookup?.enabled]);

  const handleEnableChange = (checked: boolean) => {
    setIsEnabled(checked);
    onUpdate({
      aiLookup: {
        ...question.aiLookup,
        enabled: checked,
        prompt: checked && !question.aiLookup?.prompt
          ? "Based on the answer '{{answer}}' to the question '{{question}}', provide a detailed analysis."
          : question.aiLookup?.prompt || "",
        buttons: checked ? buttons : []
      },
    });
  };

  const handleSavePrompt = () => {
    onUpdate({
      aiLookup: {
        ...question.aiLookup,
        prompt: promptValue,
        buttons
      },
    });
  };

  const handleAddButton = () => {
    const newButton = {
      id: crypto.randomUUID(),
      label: "New Analysis",
      prompt: "Analyze the answer '{{answer}}' to '{{question}}'",
      enabled: true
    };
    setButtons([...buttons, newButton]);
    setHasUnsavedChanges(true);
  };

  const handleUpdateButton = (buttonId: string, updates: Partial<AILookupButton>) => {
    setButtons(buttons.map(button => 
      button.id === buttonId ? { ...button, ...updates } : button
    ));
    setHasUnsavedChanges(true);
  };

  const handleRemoveButton = (buttonId: string) => {
    setButtons(buttons.filter(button => button.id !== buttonId));
    setHasUnsavedChanges(true);
  };

  const mergeTags = [
    { tag: "{{question}}", description: "Current question text" },
    { tag: "{{answer}}", description: "Selected option or input text" },
    { tag: "{{previousAnswer}}", description: "Previous question's answer" },
    { tag: "{{currentYear}}", description: "Current year (e.g., 2025)" },
    { tag: "{{currentDate}}", description: "Current date (e.g., February 17, 2025)" },
    { tag: "{{previousYear}}", description: "Previous year (e.g., 2024)" },
    { tag: "{{nextYear}}", description: "Next year (e.g., 2026)" },
  ];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="aiLookup"
          checked={isEnabled}
          onCheckedChange={handleEnableChange}
        />
        <Label htmlFor="aiLookup">Enable AI Lookup</Label>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>AI Analysis Buttons</Label>
              <Button onClick={handleAddButton} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Button
              </Button>
            </div>
            
            {buttons.map((button) => (
              <Card key={button.id} className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <Input
                    value={button.label}
                    onChange={(e) => handleUpdateButton(button.id, { label: e.target.value })}
                    placeholder="Button Label"
                    className="flex-1 mr-2"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveButton(button.id)}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Button Prompt</Label>
                  <Textarea
                    value={button.prompt}
                    onChange={(e) => handleUpdateButton(button.id, { prompt: e.target.value })}
                    placeholder="Enter prompt template for this button..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`button-enabled-${button.id}`}
                    checked={button.enabled}
                   onCheckedChange={(checked) => handleUpdateButton(button.id, { enabled: !!checked })}
                  />
                  <Label htmlFor={`button-enabled-${button.id}`}>Enable Button</Label>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {mergeTags.map((tag) => (
              <TooltipProvider key={tag.tag}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer text-white bg-purple-500 hover:bg-purple-600"
                      onClick={() => {
                        const textarea = document.getElementById("aiPrompt") as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const currentValue = textarea.value;
                          const newValue = currentValue.substring(0, start) + tag.tag + currentValue.substring(end);
                          setPromptValue(newValue);
                          // Set cursor position after the inserted tag
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + tag.tag.length, start + tag.tag.length);
                          }, 0);
                        }
                      }}
                    >
                      {tag.tag}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tag.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="aiPrompt">AI Prompt Template</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use merge tags to include dynamic content in your prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="aiPrompt"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter your prompt template here..."
            />
            <Button
              onClick={handleSavePrompt}
              className="mt-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Prompt
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
