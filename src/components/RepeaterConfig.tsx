import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Plus, Trash, GripVertical } from "lucide-react";
import type { RepeaterField, FieldType, RepeaterConfig as RepeaterConfigType } from "@/types/quiz";
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

export interface RepeaterConfigProps {
  config: RepeaterConfigType;
  onUpdate: (config: RepeaterConfigType) => void;
}

type DraftConfig = RepeaterConfigType  & {
  isDirty?: boolean;
}

type SortableFieldProps = {
  field: RepeaterField;
  onUpdate: (field: RepeaterField) => void;
  onRemove: (id: string) => void;
}

const SortableField = ({ field, onUpdate, onRemove }: SortableFieldProps) => {
  const [newOption, setNewOption] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <button className="cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-gray-400" />
      </button>

      <div className="flex-1 grid grid-cols-4 gap-4">
        <div>
          <Label>Label</Label>
          <Input
            className="w-full"
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
          />
        </div>

        <div>
          <Label>Type</Label>
          <Select
            value={field.type}
            onValueChange={(value: FieldType) => onUpdate({ ...field, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div className="col-span-4 mt-4 space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex gap-2">
                  <Input value={option} readOnly className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onUpdate({
                        ...field,
                        options: field.options?.filter(opt => opt !== option) || []
                      });
                    }}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)} 
                  placeholder="New option"
                  className="flex-1"
                />
                <Button onClick={() => {
                  if (newOption.trim()) {
                    onUpdate({
                      ...field,
                      options: [...(field.options || []), newOption.trim()]
                    });
                    setNewOption("");
                  }
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-end">
          <Label>Required</Label>
          <div className="flex items-center h-10 gap-2">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <Label
              htmlFor={`required-${field.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              Required field
            </Label>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(field.id)}
          className="self-end"
        >
          <Trash className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export const RepeaterConfig = ({ config, onUpdate }: RepeaterConfigProps) => {
  const [draftConfig, setDraftConfig] = useState<DraftConfig>(config);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = config.fields.findIndex(f => f.id === active.id);
      const newIndex = config.fields.findIndex(f => f.id === over.id);
      const newFields = arrayMove(draftConfig.fields, oldIndex, newIndex);
      setDraftConfig({ ...draftConfig, fields: newFields, isDirty: true });
    }
  };

  const handleAddField = () => {
    const newField: RepeaterField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'New Field',
      required: false,
    };
    setDraftConfig({
      ...draftConfig,
      fields: [...draftConfig.fields, newField],
      isDirty: true
    });
  };

  const handleUpdateField = (updatedField: RepeaterField) => {
    const newFields = draftConfig.fields.map(field =>
      field.id === updatedField.id ? {
        ...updatedField,
        // Reset options when changing away from select/radio/checkbox
        options: ['select', 'radio', 'checkbox'].includes(updatedField.type) 
          ? updatedField.options 
          : undefined
      } : field
    );
    setDraftConfig({ ...draftConfig, fields: newFields, isDirty: true });
  };

  const handleRemoveField = (fieldId: string) => {
    setDraftConfig({
      ...draftConfig,
      fields: draftConfig.fields.filter(field => field.id !== fieldId),
      isDirty: true
    });
  };

  const handleSave = () => {
    onUpdate({
      ...draftConfig,
      fields: draftConfig.fields,
      minEntries: draftConfig.minEntries,
      maxEntries: draftConfig.maxEntries,
      branchable: draftConfig.branchable
    });
    setDraftConfig({ ...draftConfig, isDirty: false });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Repeater Configuration</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="branchable"
                checked={draftConfig.branchable || false}
                onCheckedChange={(checked: boolean | string) => setDraftConfig({
                  ...draftConfig,
                  branchable: checked === true,
                  isDirty: true
                })}
              />
              <Label htmlFor="branchable">Question can be branched</Label>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddField}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!draftConfig.isDirty}
            variant={draftConfig.isDirty ? "default" : "secondary"}
          >
            Save Changes
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Minimum Entries</Label>
            <Input
              type="number"
              min="1"
              step="1"
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
              value={draftConfig.minEntries || 0}
              onChange={(e) => setDraftConfig({ 
                ...draftConfig, 
                minEntries: Math.max(1, parseInt(e.target.value) || 1),
                isDirty: true
              })}
            />
          </div>
          <div>
            <Label>Maximum Entries</Label>
            <Input
              type="number"
              min="1"
              step="1"
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
              value={draftConfig.maxEntries || 0}
              onChange={(e) => setDraftConfig({ 
                ...draftConfig, 
                maxEntries: Math.max(1, parseInt(e.target.value) || 1),
                isDirty: true
              })}
            />
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={draftConfig.fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {draftConfig.fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  onUpdate={handleUpdateField}
                  onRemove={handleRemoveField}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </Card>
  );
};