import { Injectable } from '@angular/core';
import { ScheduleOverviewTaskChangeStrategy } from '../types/schedule-overview-task-change-strategy';
import { ExecutiontTaskParameters } from '../../../step-core.module';

const DEFAULT_STRATEGY: ScheduleOverviewTaskChangeStrategy = {
  taskChanged: (task?: ExecutiontTaskParameters) => {},
};

@Injectable({
  providedIn: 'root',
})
export class SchedulerOverviewTaskChangeService implements ScheduleOverviewTaskChangeStrategy {
  private strategy = DEFAULT_STRATEGY;

  taskChanged(task?: ExecutiontTaskParameters): void {
    this.strategy.taskChanged(task);
  }

  useStrategy(strategy: ScheduleOverviewTaskChangeStrategy): void {
    this.strategy = strategy;
  }
}
