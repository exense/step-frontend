import { inject, Injectable} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectEntityOfTypeComponent } from '../components/select-entity-of-type/select-entity-of-type.component';
import { SelectEntityOfTypeData } from '../types/select-entity-of-type-data.interface';
import { filter, Observable } from 'rxjs';
import { SelectEntityOfTypeResult } from '../types/select-entity-of-type-result.interface';
import { HYBRID_INJECTOR_HELPER } from '../../basics/step-basics.module';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../shared';
import { PlanDialogsService } from '../../../services/plan-dialogs.service';

@Injectable({
  providedIn: 'root'
})
export class EntityDialogsService {
  private _injector = inject(HYBRID_INJECTOR_HELPER);
  private _matDialog = inject(MatDialog);

  selectEntityOfType(entityName: string, singleSelection: boolean, targetId?: string): Observable<SelectEntityOfTypeResult> {
    return this._matDialog
      .open<SelectEntityOfTypeComponent, SelectEntityOfTypeData, SelectEntityOfTypeResult | undefined>(
        SelectEntityOfTypeComponent,
        {
          data: {entityName, singleSelection, targetId},
          injector: this._injector
        },
      )
      .afterClosed().pipe(
        filter((result) => !!result)
      ) as Observable<SelectEntityOfTypeResult>;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('EntityDialogsService', downgradeInjectable(EntityDialogsService));
