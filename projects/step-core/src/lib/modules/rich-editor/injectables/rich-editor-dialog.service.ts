import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, Observable } from 'rxjs';
import {
  RichEditorDialogComponent,
  RichEditorDialogData,
} from '../components/rich-editor-dialog/rich-editor-dialog.component';

type Config = Partial<Omit<RichEditorDialogData, 'text'>>;

@Injectable({
  providedIn: 'root',
})
export class RichEditorDialogService {
  private _matDialog = inject(MatDialog);

  editText(text: string, config?: Config): Observable<string> {
    const { title, allowedModes, predefinedMode } = { title: 'Free text editor', ...(config ?? {}) };
    const data: RichEditorDialogData = { text, title, allowedModes, predefinedMode };
    return this._matDialog
      .open(RichEditorDialogComponent, { data, width: 'min(100rem, 80%)' })
      .afterClosed()
      .pipe(filter((result) => result !== undefined));
  }
}
