import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, Observable, switchMap, take, timer } from 'rxjs';
import {
  RichEditorDialogComponent,
  RichEditorDialogData,
} from '../components/rich-editor-dialog/rich-editor-dialog.component';

type Config = Partial<Omit<RichEditorDialogData, 'text'> & { filterEmptyResult: boolean }>;

@Injectable({
  providedIn: 'root',
})
export class RichEditorDialogService {
  private _matDialog = inject(MatDialog);

  editText(text: string, config?: Config): Observable<string> {
    const { title, allowedModes, predefinedMode, isReadOnly, wrapText, filterEmptyResult } = {
      title: 'Free text editor',
      filterEmptyResult: true,
      ...(config ?? {}),
    };
    const data: RichEditorDialogData = { text, title, allowedModes, predefinedMode, isReadOnly, wrapText };
    const dialogRef = this._matDialog.open(RichEditorDialogComponent, { data, width: 'min(100rem, 80%)' });

    dialogRef
      .afterOpened()
      .pipe(
        take(1),
        switchMap(() => timer(100)),
      )
      .subscribe(() => {
        dialogRef.componentRef?.instance.focusEditor();
      });

    let closeResult$ = dialogRef.afterClosed();
    if (filterEmptyResult) {
      closeResult$ = closeResult$.pipe(filter((result) => result !== undefined));
    }

    return closeResult$;
  }
}
