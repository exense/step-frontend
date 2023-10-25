import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Tab } from '../../../tabs/tabs.module';
import { CronValidation } from '../../types/cron/_cron-validation';
import { AlertType } from '../../../basics/shared/alert-type.enum';
import { ExpressionChangeEvent } from '../base-editor/base-editor.component';

type DialogRef = MatDialogRef<CronEditorComponent, string>;

enum CronEditorTab {
  MINUTES = 'minutes',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  PRESET = 'preset',
}

const createTab = (id: CronEditorTab, label: string): Tab => ({ id, label });

@Component({
  selector: 'step-cron-editor',
  templateUrl: './cron-editor.component.html',
  styleUrls: ['./cron-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CronEditorComponent {
  private _dialogRef = inject<DialogRef>(MatDialogRef);

  protected readonly CronEditorTab = CronEditorTab;
  protected readonly AlertType = AlertType;

  protected readonly cronEditorTabs: Tab[] = [
    createTab(CronEditorTab.PRESET, 'Preset'),
    createTab(CronEditorTab.MINUTES, 'Minutely'),
    createTab(CronEditorTab.HOURLY, 'Hourly'),
    createTab(CronEditorTab.DAILY, 'Daily'),
    createTab(CronEditorTab.WEEKLY, 'Weekly'),
    createTab(CronEditorTab.MONTHLY, 'Monthly'),
    createTab(CronEditorTab.YEARLY, 'Yearly'),
  ];

  protected selectedTab = this.cronEditorTabs[0].id;

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
