import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertType, RefreshResourceResult, StepCoreModule } from '@exense/step-core';

interface Message {
  message: string;
  alertType: AlertType;
}

@Component({
  selector: 'step-automation-package-resource-refresh-result-dialog',
  imports: [StepCoreModule],
  templateUrl: './automation-package-resource-refresh-result-dialog.component.html',
  styleUrl: './automation-package-resource-refresh-result-dialog.component.scss',
  host: {
    class: 'messages-view-dialog',
  },
  encapsulation: ViewEncapsulation.None,
})
export class AutomationPackageResourceRefreshResultDialogComponent {
  private _data = inject<RefreshResourceResult>(MAT_DIALOG_DATA);

  protected readonly messages = this.createMessageList();

  private createMessageList(): Message[] {
    const errors: Message[] = (this._data?.errorMessages ?? []).map((message) => ({
      alertType: AlertType.DANGER,
      message,
    }));
    const infos: Message[] = (this._data?.infoMessages ?? []).map((message) => ({
      alertType: AlertType.INFO,
      message,
    }));

    const result: Message[] = [...errors, ...infos];

    if (!result.length) {
      switch (this._data.resultStatus) {
        case 'REFRESHED':
          result.unshift({ alertType: AlertType.SUCCESS, message: 'Resource has been successfully refreshed' });
          break;
        case 'FAILED':
          result.unshift({ alertType: AlertType.DANGER, message: "Resource's refresh has been failed" });
          break;
        case 'NOT_REQUIRED':
          result.unshift({ alertType: AlertType.INFO, message: "Resource's refresh not required" });
          break;
        default:
          break;
      }
    }

    return result;
  }
}
