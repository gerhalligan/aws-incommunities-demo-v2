export interface FileMetadata {
  path: string;
  name: string;
  size: number;
  type: string;
  formData?: Record<string, string>;
}

export interface FileUploadAnswer {
  files: FileMetadata[];
  formData?: Record<string, string>;
}