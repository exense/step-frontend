import { Component, HostListener, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CronValidation } from '../../types/cron/_cron-validation';
import { AlertType } from '../../../basics/types/alert-type.enum';
import { CronEditorTab } from '../../types/cron-editor-tab.enum';
import { Tab } from '../../../tabs';

type DialogRef = MatDialogRef<CronEditorComponent, string>;

const createTab = (id: CronEditorTab, label: string): Tab<CronEditorTab> => ({ id, label });

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
  [CronEditorTab.ANY_DAY_TIME_RANGE]: 'Any Day',
};

@Component({
  selector: 'step-cron-editor',
  templateUrl: './cron-editor.component.html',
  styleUrls: ['./cron-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
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

  handleExpressionChange(expression: string): void {
    this.cronExpression = expression;
    this.isExpressionValid = CronValidation.validate(this.cronExpression);
  }

  @HostListener('keydown.enter')
  apply(): void {
    if (!this.cronExpression) {
      this.isExpressionValid = false;
    }
    if (!this.isExpressionValid) {
      return;
    }
    this._dialogRef.close(this.cronExpression);
  }
}
