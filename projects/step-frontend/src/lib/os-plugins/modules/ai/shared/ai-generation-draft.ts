import { AiGenerationInputType, AiGenerationMode } from './ai-generation-mode';

export interface AiPromptDraft {
  type: AiGenerationInputType.PROMPT;
  prompt: string;
  mode: AiGenerationMode;
}

export interface AiTestCaseDraft {
  name: string;
  description: string;
  instructions?: string;
}

export interface AiTestCasesDraft {
  type: AiGenerationInputType.TEST_CASES;
  testCases: readonly AiTestCaseDraft[];
  sharedInstructions?: string;
}

export interface AiSpecificationDraft {
  type: AiGenerationInputType.SPECIFICATION;
  specification: string;
  sharedInstructions?: string;
  sourceFileName?: string;
}

export type AiGenerationDraft = AiPromptDraft | AiTestCasesDraft | AiSpecificationDraft;
