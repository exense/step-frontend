import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AugmentedSchedulerService, ExecutiontTaskParameters, Plan } from '@exense/step-core';

@Component({
  selector: 'step-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
})
export class ScheduleOverviewComponent implements OnInit {
  private _scheduleApi = inject(AugmentedSchedulerService);
  private taskId?: string;
  private _taskData?: ExecutiontTaskParameters;

  protected task = this._taskData;

  protected plan?: Partial<Plan>;

  protected error = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.url.subscribe((segments) => {
      segments[segments.length - 1].path;
      this.taskId = segments[segments.length - 1].path;
      if (this.taskId) {
        this._scheduleApi.getExecutionTaskById(this.taskId).subscribe({
          next: (task) => {
            this.task = task;
            this.initializeTask();
          },
          error: () => {
            this.error = 'Invalid Task Id or server error.';
          },
        });
      } else {
        this.error = 'Task Id not found in the URL.';
      }
    });
  }

  private initializeTask(): void {
    if (this.task) {
      if (!this.task.attributes) {
        this.task.attributes = {};
      }
      if (!this.task.executionsParameters) {
        this.task.executionsParameters = {};
      }
      if (!this.task.executionsParameters.customParameters) {
        this.task.executionsParameters.customParameters = {};
      }

      const repository = this.task?.executionsParameters?.repositoryObject;
      if (repository?.repositoryID === 'local') {
        const planId = repository?.repositoryParameters?.['planid'];
        if (planId) {
          const id = planId;
          const name = this.task.executionsParameters.description ?? '';
          this.plan = {
            id,
            attributes: { name },
          };
        }
      } else {
        this.repositoryId = repository?.repositoryID;
        this.repositoryPlanId =
          repository?.repositoryParameters?.['planid'] ?? repository?.repositoryParameters?.['planId'];
      }
    }
  }
}
