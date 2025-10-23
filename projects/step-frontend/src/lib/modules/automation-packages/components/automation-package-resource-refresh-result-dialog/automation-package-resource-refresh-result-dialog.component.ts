import { Component, inject } from '@angular/core';
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
    class: 'message-view-dialog',
  },
})
export class AutomationPackageResourceRefreshResultDialogComponent {
  private _data = inject<RefreshResourceResult>(MAT_DIALOG_DATA);

  protected readonly messages = this.createMessageList();

  private createMessageList(): Message[] {
    const result: Message[] = [];
    switch (this._data.resultStatus) {
      case 'REFRESHED':
        result.push({ alertType: AlertType.SUCCESS, message: 'Resource has been successfully refreshed' });
        break;
      case 'FAILED':
        result.push({ alertType: AlertType.DANGER, message: "Resource's refresh has been failed" });
        break;
      case 'NOT_REQUIRED':
        result.push({ alertType: AlertType.INFO, message: "Resource's refresh not required" });
        break;
      default:
        break;
    }
    const errors: Message[] = (this._data?.errorMessages ?? []).map((message) => ({
      alertType: AlertType.DANGER,
      message,
    }));
    const infos: Message[] = (this._data?.infoMessages ?? []).map((message) => ({
      alertType: AlertType.INFO,
      message,
    }));
    result.push(...errors, ...infos);
    return result;
  }
}
