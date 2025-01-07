import { FormField, Question } from "@/types/quiz";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import { FileMetadata } from "@/types/files";

interface FileUploadProps {
  question: Question;
  onFileChange: (files: File[], index: number, formData?: Record<string, string>) => void;
  initialFiles?: FileMetadata[]; // Add this prop
  onFormChange?: (formData: Record<string, string>[]) => void;
}

interface FormData {
  [key: string]: string;
}

export const FileUpload = ({ question, onFileChange, initialFiles, onFormChange }: FileUploadProps) => {
  const metadata = question.fileUploadMetadata;
  const [formData, setFormData] = useState<FormData[]>([]);

  useEffect(() => {
    if (initialFiles?.length) {
      const existingFormData = initialFiles.map(file => file.formData || {});
      setFormData(existingFormData);
    }
  }, [initialFiles]);

  useEffect(() => {
    if (onFormChange) {
      onFormChange(formData);
    }
  }, [formData, onFormChange]);

  // Move the early return after all hooks
  if (!metadata?.enabled) return null;

  const handleFormChange = (fileIndex: number, fieldId: string, value: string) => {
    setFormData(prev => {
      const newData = [...prev];
      if (!newData[fileIndex]) {
        newData[fileIndex] = {};
      }
      newData[fileIndex] = { ...newData[fileIndex], [fieldId]: value };
      return newData;
    });
  };

  const renderField = (field: FormField, fileIndex: number) => {
    const value = formData[fileIndex]?.[field.id] || "";

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFormChange(fileIndex, field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
            maxLength={field.validation?.maxLength}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFormChange(fileIndex, field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
      case 'memo':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFormChange(fileIndex, field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.validation?.required}
            maxLength={field.validation?.maxLength}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(value) => handleFormChange(fileIndex, field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {Array.from({ length: metadata.maxFiles }).map((_, fileIndex) => (
        <div key={fileIndex} className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            File Upload {fileIndex + 1}
          </h3>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {metadata.fileLabels[fileIndex] || `File ${fileIndex + 1}`}
              {metadata.fileRequirements[fileIndex] && (
                <span className="text-red-500">*</span>
              )}
            </Label>
            <Input
              type="file"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const currentFormData = formData[fileIndex] || {}; // Get current form data or empty object
                onFileChange(files, fileIndex, currentFormData);
              }}
              required={metadata.fileRequirements[fileIndex]}
              className={cn(
                "cursor-pointer",
                metadata.fileRequirements[fileIndex] && "border-red-200"
              )}
            />
          </div>

          {metadata.formConfigs?.[fileIndex]?.length > 0 && (
            <div className="space-y-4 mt-4">
              <Label>Additional Information</Label>
              {metadata.formConfigs[fileIndex].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.validation?.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {renderField(field, fileIndex)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
