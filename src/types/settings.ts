export type AIProvider = 'openai' | 'perplexity';

export interface AISettings {
  provider: AIProvider;
  openaiApiKey?: string;
  perplexityApiKey?: string;
}

export interface UserSettings {
  ai: AISettings;
  [key: string]: any;
}