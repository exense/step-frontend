import { ExecutiontTaskParameters } from '@exense/step-core';

export abstract class SchedulerInvokerService {
  abstract openScheduler(task: ExecutiontTaskParameters): void;
}
