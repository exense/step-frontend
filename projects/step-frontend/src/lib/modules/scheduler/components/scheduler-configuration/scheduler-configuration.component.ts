import { Component, inject, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AugmentedSettingsService } from '@exense/step-core';
import { forkJoin, map } from 'rxjs';

const SCHEDULER_ENABLED = 'scheduler_enabled';
const SCHEDULER_EXECUTION_USERNAME = 'scheduler_execution_username';

@Component({
  selector: 'step-scheduler-configuration',
  templateUrl: './scheduler-configuration.component.html',
  styleUrls: ['./scheduler-configuration.component.scss'],
})
export class SchedulerConfigurationComponent implements OnInit {
  private _api = inject(AugmentedSettingsService);

  protected schedulerEnableToggle = false;
  protected executionUser = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  protected handleSchedulerEnableChange(value: boolean): void {
    this.schedulerEnableToggle = value;
    this._api.saveSetting(SCHEDULER_ENABLED, value.toString()).subscribe();
  }

  protected saveUserName(): void {
    this._api.saveSetting(SCHEDULER_EXECUTION_USERNAME, this.executionUser).subscribe();
  }

  private loadSettings(): void {
    const schedulerEnableToggle$ = this._api
      .getSettingAsText(SCHEDULER_ENABLED)
      .pipe(map((response) => response === 'true'));

    const executionUser$ = this._api
      .getSettingAsText(SCHEDULER_EXECUTION_USERNAME)
      .pipe(map((response) => response ?? ''));

    forkJoin([schedulerEnableToggle$, executionUser$]).subscribe(([schedulerEnableToggle, executionUser]) => {
      this.schedulerEnableToggle = schedulerEnableToggle;
      this.executionUser = executionUser;
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepSchedulerConfiguration', downgradeComponent({ component: SchedulerConfigurationComponent }));
