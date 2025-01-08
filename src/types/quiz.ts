export interface Option {
  id: string;
  text: string;
  nextQuestionId?: number;
  dependsOn?: {
    questionId: number;
    optionId: string;
  }[];
  buttonResponses?: Record<string, string>;
}

interface RepeaterBranch {
  entryId: string;
  entryValues: Record<string, string | string[]>;
  branchAnswers: Map<number, string | Option>;
  isComplete: boolean;
  parentQuestion?: {
    id: number;
    repeaterConfig: RepeaterConfig;
  };
  entryIndex?: number; // Add this field
}

export interface InputValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'memo' | 'select';
  placeholder?: string;
  validation?: InputValidation;
  options?: string[]; // For select fields
}

export interface FileUploadMetadata {
  enabled: boolean;
  required: boolean;
  maxFiles: number;
  fileLabels: string[];
  fileRequirements: boolean[];
  formConfigs?: FormField[][]; // Array of form fields for each file
}

interface AILookupButton {
  id: string;
  label: string;
  prompt: string;
  enabled: boolean;
}

export interface AILookup {
  enabled: boolean;
  prompt: string;  // Keep for backward compatibility
  response?: string;  // Keep for backward compatibility
  buttons?: AILookupButton[];  // Add new buttons array
}


export interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'input' | 'repeater';
  options: Option[];
  defaultNextQuestionId?: number;
  dependsOn?: {
    questionId: number;
    options: string[];
  }[];
  repeaterConfig?: RepeaterConfig;
  inputMetadata?: {
    inputType: 'text' | 'number';
    placeholder?: string;
    validation?: InputValidation;
  };
  fileUploadMetadata?: FileUploadMetadata;
  aiLookup?: AILookup;
  isRepeaterBranch?: boolean;
  parentRepeaterId?: number;
  repeaterBranches?: RepeaterBranch[];
}

export type FieldType = 'text' | 'number' | 'email' | 'select' | 'radio' | 'checkbox' | 'textarea';

export interface RepeaterField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  validation?: InputValidation;
  required?: boolean;
}

export interface RepeaterConfig {
  fields: RepeaterField[];
  minEntries?: number;
  maxEntries?: number;
  branchable?: boolean;
}

export interface RepeaterEntry {
  id: string;
  values: Record<string, string | string[]>;
}