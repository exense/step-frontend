import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CronEditorComponent } from '../components/cron-editor/cron-editor.component';
import { CronEditorTab } from '../types/cron-editor-tab.enum';

const DEFAULT_TABS: CronEditorTab[] = [
  CronEditorTab.PRESET,
  CronEditorTab.MINUTES,
  CronEditorTab.HOURLY,
  CronEditorTab.DAILY,
  CronEditorTab.WEEKLY,
  CronEditorTab.MONTHLY,
  CronEditorTab.YEARLY,
];

@Injectable({
  providedIn: 'root',
})
export class CronService {
  private _matDialog = inject(MatDialog);

  configureExpression(...availableTabs: CronEditorTab[]): Observable<string | undefined> {
    const data = availableTabs.length === 0 ? DEFAULT_TABS : availableTabs;
    return this._matDialog.open(CronEditorComponent, { data, minWidth: '70rem' }).afterClosed();
  }
}
