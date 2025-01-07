import { Question } from "@/types/quiz";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FormFieldConfig } from "./FormFieldConfig";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";

interface FileUploadConfigProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export const FileUploadConfig = ({ question, onUpdate }: FileUploadConfigProps) => {
  useEffect(() => {
    setUnsavedMetadata(
      question.fileUploadMetadata || {
        enabled: false,
        required: false,
        maxFiles: 1,
        fileLabels: ["Upload File"],
        fileRequirements: [false],
        formConfigs: [[]]
      }
    );
    setHasUnsavedChanges(false);
  }, [question.fileUploadMetadata]);
  
  const [unsavedMetadata, setUnsavedMetadata] = useState(
    question.fileUploadMetadata || {
      enabled: false,
      required: false,
      maxFiles: 1,
      fileLabels: ["Upload File"],
      fileRequirements: [false],
      formConfigs: [[]]
    }
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const metadata = question.fileUploadMetadata || {
    enabled: false,
    required: false,
    maxFiles: 1,
    fileLabels: ["Upload File"],
    fileRequirements: [false],
    formConfigs: [[]]
  };

  const handleEnableChange = (checked: boolean) => {
    const updatedMetadata = {
      ...unsavedMetadata,
      enabled: checked,
      // Reset other properties if disabling
      ...(checked === false && {
        maxFiles: 1,
        required: false,
        fileLabels: ["Upload File"],
        fileRequirements: [false],
        formConfigs: [[]]
      })
    };
    
    // Update local state
    setUnsavedMetadata(updatedMetadata);
    
    // Immediately save changes
    onUpdate({
      fileUploadMetadata: updatedMetadata
    });
    
    setHasUnsavedChanges(false);
  };

  const handleMaxFilesChange = (value: string) => {
    const maxFiles = parseInt(value) || 1;
    setUnsavedMetadata({
      ...unsavedMetadata,
      maxFiles,
      fileLabels: Array(maxFiles).fill("").map((_, i) => 
        unsavedMetadata.fileLabels[i] || `Upload File ${i + 1}`
      ),
      fileRequirements: Array(maxFiles).fill(false).map((_, i) =>
        unsavedMetadata.fileRequirements?.[i] || false
      ),
      formConfigs: Array(maxFiles).fill([]).map((_, i) =>
        unsavedMetadata.formConfigs?.[i] || []
      )
    });
    setHasUnsavedChanges(true);
  };

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...unsavedMetadata.fileLabels];
    newLabels[index] = value;
    setUnsavedMetadata({
      ...unsavedMetadata,
      fileLabels: newLabels
    });
    setHasUnsavedChanges(true);
  };

  const handleRequiredChange = (index: number, checked: boolean) => {
    const newRequirements = [...(unsavedMetadata.fileRequirements || [])];
    newRequirements[index] = checked;
    setUnsavedMetadata({
      ...unsavedMetadata,
      fileRequirements: newRequirements
    });
    setHasUnsavedChanges(true);
  };

  const handleFormConfigUpdate = (index: number, fields: any[]) => {
    const newFormConfigs = [...(unsavedMetadata.formConfigs || [])];
    newFormConfigs[index] = fields;
    setUnsavedMetadata({
      ...unsavedMetadata,
      formConfigs: newFormConfigs
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onUpdate({
      fileUploadMetadata: unsavedMetadata
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableFileUpload"
          checked={unsavedMetadata.enabled}
          onCheckedChange={handleEnableChange}
        />
        <Label htmlFor="enableFileUpload">Enable File Upload</Label>
      </div>

      {unsavedMetadata.enabled && (
        <div className="space-y-4 pl-6">
          <div className="space-y-2">
            <Label htmlFor="maxFiles">Maximum Number of Files</Label>
            <Input
              id="maxFiles"
              type="number"
              min="1"
              max="10"
              value={unsavedMetadata.maxFiles}
              onChange={(e) => handleMaxFilesChange(e.target.value)}
              className="w-32"
            />
          </div>

          <div className="space-y-2">
            <Label>File Configuration</Label>
            {unsavedMetadata.fileLabels.map((label, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  File Upload Configuration {index + 1}
                </h3>
                <div className="flex items-center gap-4">
                  <Input
                    value={label}
                    onChange={(e) => handleLabelChange(index, e.target.value)}
                    placeholder={`Label for file ${index + 1}`}
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={unsavedMetadata.fileRequirements?.[index] || false}
                      onCheckedChange={(checked) => handleRequiredChange(index, checked as boolean)}
                    />
                    <Label htmlFor={`required-${index}`}>Required</Label>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="mb-2 block">Form Fields</Label>
                  <FormFieldConfig
                    fields={unsavedMetadata.formConfigs?.[index] || []}
                    onUpdate={(fields) => handleFormConfigUpdate(index, fields)}
                  />
                </div>
              </div>
            ))}
          </div>
          {hasUnsavedChanges && (
            <Button 
              onClick={handleSave}
              className="mt-4"
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
