import { FileMetadata } from './files';

export interface BranchContext {
  branchId: string;
  parentQuestionId: number;
  entryId: string;
}

export interface BaseAnswer {
  type: 'text' | 'multiple-choice' | 'file' | 'repeater';
  branchContext?: BranchContext;
}

export interface TextAnswer extends BaseAnswer {
  type: 'text';
  value: string;
  aiAnalysis?: string;
}

export interface MultipleChoiceAnswer extends BaseAnswer {
  type: 'multiple-choice';
  optionId: string;
  value: string;
  aiAnalysis?: string;
}

export interface FileAnswer extends BaseAnswer {
  type: 'file';
  files: FileMetadata[];
  formData?: Record<string, string>;
}

export interface RepeaterAnswer extends BaseAnswer {
  type: 'repeater';
  value: string;
}

export type Answer = TextAnswer | MultipleChoiceAnswer | FileAnswer | RepeaterAnswer;