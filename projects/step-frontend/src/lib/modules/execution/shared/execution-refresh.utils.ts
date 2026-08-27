import { Execution } from '@exense/step-core';

export const isExecutionCompletionTransition = (
  previous: Pick<Execution, 'status'>,
  current: Pick<Execution, 'status'>,
): boolean => previous.status !== 'ENDED' && current.status === 'ENDED';
