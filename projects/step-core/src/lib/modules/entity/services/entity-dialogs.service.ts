import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectEntityOfTypeComponent } from '../components/select-entity-of-type/select-entity-of-type.component';
import { SelectEntityOfTypeData } from '../types/select-entity-of-type-data.interface';
import { filter, Observable } from 'rxjs';
import { SelectEntityOfTypeResult } from '../types/select-entity-of-type-result.interface';
import { HYBRID_INJECTOR_HELPER } from '../../basics/step-basics.module';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';

@Injectable({
  providedIn: 'root',
})
export class EntityDialogsService {
  private _injector = inject(HYBRID_INJECTOR_HELPER);
  private _matDialog = inject(MatDialog);

  selectEntityOfType(
    entityName: string,
    singleSelection: boolean,
    additionalParams?: { targetId?: string; sourceId?: string; tableFilter?: string }
  ): Observable<SelectEntityOfTypeResult> {
    const { targetId, sourceId, tableFilter } = additionalParams ?? {};
    return this._matDialog
      .open<SelectEntityOfTypeComponent, SelectEntityOfTypeData, SelectEntityOfTypeResult | undefined>(
        SelectEntityOfTypeComponent,
        {
          data: { entityName, singleSelection, targetId, sourceId, tableFilter },
          injector: this._injector,
        }
      )
      .afterClosed()
      .pipe(filter((result) => !!result)) as Observable<SelectEntityOfTypeResult>;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('EntityDialogsService', downgradeInjectable(EntityDialogsService));
