import { useState } from "react";
import { FormField } from "@/types/quiz";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus, Trash } from "lucide-react";

interface FormFieldConfigProps {
  fields: FormField[];
  onUpdate: (fields: FormField[]) => void;
}

export const FormFieldConfig = ({ fields, onUpdate }: FormFieldConfigProps) => {
  const [newOption, setNewOption] = useState("");

  const handleAddField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      label: "New Field",
      type: "text",
      placeholder: "",
      validation: {
        required: false
      }
    };
    onUpdate([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    onUpdate(updatedFields);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    onUpdate(updatedFields);
  };

  const handleAddOption = (fieldIndex: number) => {
    if (!newOption.trim()) return;
    
    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    field.options = [...(field.options || []), newOption.trim()];
    onUpdate(updatedFields);
    setNewOption("");
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    const field = updatedFields[fieldIndex];
    field.options = field.options?.filter((_, i) => i !== optionIndex);
    onUpdate(updatedFields);
  };

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Field {index + 1}</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveField(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Field Label</Label>
              <Input
                value={field.label}
                onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            <div>
              <Label>Field Type</Label>
              <Select
                value={field.type}
                onValueChange={(value: FormField['type']) => handleUpdateField(index, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="number">Number Input</SelectItem>
                  <SelectItem value="memo">Memo Field</SelectItem>
                  <SelectItem value="select">Select Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                placeholder="Enter placeholder text"
              />
            </div>

            {field.type === 'select' && (
              <div className="space-y-2">
                <Label>Options</Label>
                {field.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <Input value={option} readOnly />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index, optionIndex)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="New option"
                  />
                  <Button onClick={() => handleAddOption(index)}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Validation</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.validation?.required}
                    onChange={(e) =>
                      handleUpdateField(index, {
                        validation: { ...field.validation, required: e.target.checked }
                      })
                    }
                  />
                  <Label>Required</Label>
                </div>

                {(field.type === 'text' || field.type === 'memo') && (
                  <div>
                    <Label>Max Length</Label>
                    <Input
                      type="number"
                      value={field.validation?.maxLength || ""}
                      onChange={(e) =>
                        handleUpdateField(index, {
                          validation: {
                            ...field.validation,
                            maxLength: parseInt(e.target.value) || undefined
                          }
                        })
                      }
                    />
                  </div>
                )}

                {field.type === 'number' && (
                  <div className="flex gap-4">
                    <div>
                      <Label>Min Value</Label>
                      <Input
                        type="number"
                        value={field.validation?.min || ""}
                        onChange={(e) =>
                          handleUpdateField(index, {
                            validation: {
                              ...field.validation,
                              min: parseInt(e.target.value) || undefined
                            }
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Max Value</Label>
                      <Input
                        type="number"
                        value={field.validation?.max || ""}
                        onChange={(e) =>
                          handleUpdateField(index, {
                            validation: {
                              ...field.validation,
                              max: parseInt(e.target.value) || undefined
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button onClick={handleAddField} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Field
      </Button>
    </div>
  );
};