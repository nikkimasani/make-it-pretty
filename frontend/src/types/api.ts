export interface ApiError {
  detail: string;
  code?: string;
}

export interface ProcessRequest {
  content: string;
  grammar_check?: boolean;
  emoji_enrichment?: boolean;
  tab_size?: number;
  filename?: string;
}

export interface GrammarSuggestion {
  start: number;
  end: number;
  original: string;
  suggestion: string;
  message: string;
}

export interface ProcessResponse {
  original: string;
  result: string;
  format?: string;
  metadata?: Record<string, unknown>;
  grammar_check_applied?: boolean;
  emoji_enrichment_applied?: boolean;
  suggestions?: GrammarSuggestion[];
  writing_direction?: string;
  character_count?: number;
  original_lines?: number;
  result_lines?: number;
  language?: string;
  formatter?: string;
  success?: boolean;
  processing_time?: number;
  warnings?: string[];
  recovery_attempted?: boolean;
  recovery_error?: string | null;
  validation_passed?: boolean;
  validation_error?: string | null;
  transformations?: string[];
}

export interface UploadResponse {
  filename: string;
  content: string;
  format: string;
  size: number;
}

export interface TabulateResponse {
  columns: string[];
  rows: Record<string, string>[];
  total_rows: number;
  format: string;
  metadata: Record<string, unknown>;
}

export interface ReaderResponse {
  original: string;
  result: string;
  format: string;
  title: string;
  word_count: number;
  reading_time_minutes: number;
  metadata: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  version: string;
}
