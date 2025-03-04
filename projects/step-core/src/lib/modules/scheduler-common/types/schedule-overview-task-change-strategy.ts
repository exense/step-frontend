import { ExecutiontTaskParameters } from '../../../client/step-client-module';

export interface ScheduleOverviewTaskChangeStrategy {
  taskChanged(task?: ExecutiontTaskParameters): void;
}
