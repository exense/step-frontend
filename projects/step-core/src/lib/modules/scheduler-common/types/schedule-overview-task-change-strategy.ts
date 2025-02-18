import { ExecutiontTaskParameters } from '@exense/step-core';

export interface ScheduleOverviewTaskChangeStrategy {
  taskChanged(task?: ExecutiontTaskParameters): void;
}
