import { AsyncTaskStatusObject, AsyncTaskStatusResource, AsyncTaskStatusVoid } from '../../generated';

export type AsyncTaskStatus = AsyncTaskStatusVoid | AsyncTaskStatusObject | AsyncTaskStatusResource;
