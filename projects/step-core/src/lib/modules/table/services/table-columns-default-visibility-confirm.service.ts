import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ConfirmVisibilityStrategy } from '../types/confirm-visibility-strategy';
import { ScreenInput } from '../../../client/generated';
import { AlertType, DialogsService } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class TableColumnsDefaultVisibilityConfirmService implements ConfirmVisibilityStrategy {
  private _dialogs = inject(DialogsService);

  confirmVisibility(screenInput: ScreenInput): Observable<{ isVisible?: boolean; scope?: string[] }> {
    return this._dialogs
      .showWarning(`Should the column "${screenInput.input?.label}" be visible by default?`, AlertType.DEFAULT)
      .pipe(map((isVisible) => ({ isVisible })));
  }
}
