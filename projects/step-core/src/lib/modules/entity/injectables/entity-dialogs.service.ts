import { inject, Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectEntityOfTypeComponent } from '../components/select-entity-of-type/select-entity-of-type.component';
import { SelectEntityOfTypeData } from '../types/select-entity-of-type-data.interface';
import { filter, Observable } from 'rxjs';
import { SelectEntityOfTypeResult } from '../types/select-entity-of-type-result.interface';

@Injectable({
  providedIn: 'root',
})
export class EntityDialogsService {
  private _injector = inject(Injector);
  private _matDialog = inject(MatDialog);

  selectEntityOfType(
    entityName: string,
    additionalParams?: { targetId?: string; sourceId?: string; tableFilter?: string }
  ): Observable<SelectEntityOfTypeResult> {
    const { targetId, sourceId, tableFilter } = additionalParams ?? {};
    return this._matDialog
      .open<SelectEntityOfTypeComponent, SelectEntityOfTypeData, SelectEntityOfTypeResult | undefined>(
        SelectEntityOfTypeComponent,
        {
          data: { entityName, targetId, sourceId, tableFilter },
          injector: this._injector,
        }
      )
      .afterClosed()
      .pipe(filter((result) => !!result)) as Observable<SelectEntityOfTypeResult>;
  }
}
