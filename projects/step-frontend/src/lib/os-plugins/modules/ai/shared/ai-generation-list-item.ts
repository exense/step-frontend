export interface AiGenerationListItem {
  id: string;
  title: string;
}

export enum AiGenerationListStateType {
  LOADING = 'LOADING',
  EMPTY = 'EMPTY',
  CONTENT = 'CONTENT',
  ERROR = 'ERROR',
}

export type AiGenerationListState =
  | {
      type: AiGenerationListStateType.LOADING;
    }
  | {
      type: AiGenerationListStateType.EMPTY;
    }
  | {
      type: AiGenerationListStateType.CONTENT;
      items: readonly AiGenerationListItem[];
    }
  | {
      type: AiGenerationListStateType.ERROR;
      message: string;
    };
