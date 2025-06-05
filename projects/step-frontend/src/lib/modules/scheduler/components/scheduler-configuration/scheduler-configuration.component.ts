import { Component, inject, OnInit } from '@angular/core';
import { AugmentedSchedulerService, AugmentedSettingsService } from '@exense/step-core';
import { forkJoin, map } from 'rxjs';

const SCHEDULER_ENABLED = 'scheduler_enabled';
const SCHEDULER_EXECUTION_USERNAME = 'scheduler_execution_username';

@Component({
  selector: 'step-scheduler-configuration',
  templateUrl: './scheduler-configuration.component.html',
  styleUrls: ['./scheduler-configuration.component.scss'],
  standalone: false,
})
export class SchedulerConfigurationComponent implements OnInit {
  private _settingsApi = inject(AugmentedSettingsService);
  private _schedulerApi = inject(AugmentedSchedulerService);

  protected schedulerEnableToggle = false;
  protected executionUser = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  protected handleSchedulerEnableChange(value: boolean): void {
    this.schedulerEnableToggle = value;
    this._schedulerApi.enableAllExecutionTasksSchedule(value).subscribe();
  }

  protected saveUserName(): void {
    this._settingsApi.saveSetting(SCHEDULER_EXECUTION_USERNAME, this.executionUser).subscribe();
  }

  private loadSettings(): void {
    const schedulerEnableToggle$ = this._settingsApi
      .getSettingAsText(SCHEDULER_ENABLED)
      .pipe(map((response) => response === 'true'));

    const executionUser$ = this._settingsApi
      .getSettingAsText(SCHEDULER_EXECUTION_USERNAME)
      .pipe(map((response) => response ?? ''));

    forkJoin([schedulerEnableToggle$, executionUser$]).subscribe(([schedulerEnableToggle, executionUser]) => {
      this.schedulerEnableToggle = schedulerEnableToggle;
      this.executionUser = executionUser;
    });
  }
}
