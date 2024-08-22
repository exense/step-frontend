import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AugmentedSchedulerService, ExecutiontTaskParameters } from '@exense/step-core';

@Component({
  selector: 'step-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
})
export class ScheduleOverviewComponent implements OnInit {
  private _scheduleApi = inject(AugmentedSchedulerService);
  private taskId?: string;
  private _taskData?: ExecutiontTaskParameters;

  protected error = '';
  protected task = this._taskData;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.url.subscribe((segments) => {
      segments[segments.length - 1].path;
      this.taskId = segments[segments.length - 1].path;
      if (this.taskId) {
        this._scheduleApi.getExecutionTaskById(this.taskId).subscribe({
          next: (task) => (this.task = task),
          error: () => {
            this.error = 'Invalid Task Id or server error.';
          },
        });
      } else {
        this.error = 'Task Id not found in the URL.';
      }
    });
  }
}
