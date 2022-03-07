import { AsyncTaskResultItemDto } from './async-task-result-item-dto';

export type AsyncTaskResultEntities = { [entity: string]: AsyncTaskResultItemDto };

export interface AsyncTaskResultDto {
  id: string;
  progress: number;
  status?: string;
  ready: boolean;
  result: AsyncTaskResultEntities;
  warnings?: string[];
}
