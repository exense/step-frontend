import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CronEditorComponent } from '../components/cron-editor/cron-editor.component';

@Injectable({
  providedIn: 'root',
})
export class CronService {
  private _matDialog = inject(MatDialog);

  configureExpression(): Observable<string | undefined> {
    return this._matDialog.open(CronEditorComponent).afterClosed();
  }
}
