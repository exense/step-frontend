import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { DialogsService, GridEditableService, WidgetsPersistenceStateService } from '@exense/step-core';
import { map } from 'rxjs';

export const altExecutionReportLayoutDeactivateGuard: CanDeactivateFn<unknown> = () => {
  const _gridEditable = inject(GridEditableService);
  if (!_gridEditable.editMode()) {
    return true;
  }

  const _dialogs = inject(DialogsService);
  const _widgetPersistence = inject(WidgetsPersistenceStateService);

  return _dialogs
    .showWarning('Navigating away will discard all changes to the layout.', {
      confirmButtonLabel: 'Ok',
      confirmButtonAppearance: 'stroked',
      cancelButtonLabel: 'Keep editing',
      cancelButtonAppearance: 'flat',
      cancelButtonColor: 'primary',
    })
    .pipe(
      map((isConfirmed) => {
        if (!isConfirmed) {
          return false;
        }

        _widgetPersistence.resetState();
        _gridEditable.setEditMode(false);
        return true;
      }),
    );
};
