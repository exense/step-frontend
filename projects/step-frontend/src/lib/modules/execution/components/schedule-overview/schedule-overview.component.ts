import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AugmentedSchedulerService, ExecutiontTaskParameters, Plan } from '@exense/step-core';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'step-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
})
export class ScheduleOverviewComponent implements OnInit {
  private _scheduleApi = inject(AugmentedSchedulerService);
  private _route = inject(ActivatedRoute);
  private taskId?: string;
  private taskData?: ExecutiontTaskParameters;

  protected task = this.taskData;

  protected plan?: Partial<Plan>;

  protected error = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

  ngOnInit(): void {
    this._route.url.subscribe((segments) => {
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
    this._route.url
      .pipe(
        takeUntilDestroyed(),
        switchMap((segments) => {
          if (this.taskId) {
            this.taskId = segments[segments.length - 1].path;
            return this._scheduleApi.getExecutionTaskById(this.taskId);
          } else {
            this.error = 'Task Id not found in the URL.';
            return EMPTY;
          }
        }),
      )
      .subscribe({
        next: (task) => {
          this.task = task;
          this.initializeTask();
        },
        error: () => {
          this.error = 'Invalid Task Id or server error.';
        },
      });
  }

  private initializeTask(): void {
    if (!this.task) {
      return;
    }

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
