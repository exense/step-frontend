import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tab } from '../../../tabs/tabs.module';
import { CronValidation } from '../../types/cron/_cron-validation';
import { AlertType } from '../../../basics/shared/alert-type.enum';
import { ExpressionChangeEvent } from '../base-editor/base-editor.component';
import { CronEditorTab } from '../../types/cron-editor-tab.enum';

type DialogRef = MatDialogRef<CronEditorComponent, string>;

const createTab = (id: CronEditorTab, label: string): Tab => ({ id, label });

const CRON_EDITOR_TAB_LABELS: Record<CronEditorTab, string> = {
  [CronEditorTab.PRESET]: 'Preset',
  [CronEditorTab.MINUTES]: 'Minutely',
  [CronEditorTab.HOURLY]: 'Hourly',
  [CronEditorTab.DAILY]: 'Daily',
  [CronEditorTab.WEEKLY]: 'Weekly',
  [CronEditorTab.MONTHLY]: 'Monthly',
  [CronEditorTab.YEARLY]: 'Yearly',
  [CronEditorTab.TIME_RANGE]: 'Date',
  [CronEditorTab.WEEKLY_TIME_RANGE]: 'Weekly',
};

@Component({
  selector: 'step-cron-editor',
  templateUrl: './cron-editor.component.html',
  styleUrls: ['./cron-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CronEditorComponent {
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _availableTabs = inject<CronEditorTab[]>(MAT_DIALOG_DATA);

  protected readonly CronEditorTab = CronEditorTab;
  protected readonly AlertType = AlertType;

  protected readonly cronEditorTabs = this._availableTabs.map((id) => createTab(id, CRON_EDITOR_TAB_LABELS[id]));

  protected selectedTab: string = this._availableTabs[0];

  protected cronExpression = '';

  protected isExpressionValid = false;

  protected isTouched = false;

  handleExpressionChange({ expression, isTouched }: ExpressionChangeEvent): void {
    this.cronExpression = expression;
    this.isTouched = isTouched;
    this.isExpressionValid = CronValidation.validate(this.cronExpression);
  }

  apply(): void {
    if (!this.isExpressionValid) {
      return;
    }
    this._dialogRef.close(this.cronExpression);
  }
}
