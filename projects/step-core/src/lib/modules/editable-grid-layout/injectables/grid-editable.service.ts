import { inject, Injectable } from '@angular/core';
import { WidgetsPersistenceStateService } from './widgets-persistence-state.service';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';

@Injectable()
export class GridEditableService {
  private _widgetsPersistenceState = inject(WidgetsPersistenceStateService);
  private _widgetsPositionsState = inject(WidgetsPositionsStateService);

  readonly editMode = this._widgetsPositionsState.editMode;
  readonly hasChanges = this._widgetsPersistenceState.hasChanges;

  setEditMode(value: boolean): void {
    this._widgetsPositionsState.setEditMode(value);
  }
}
