import { inject, Injectable } from '@angular/core';
import { DialogsService, KeywordPackagesService } from '@exense/step-core';
import { filter, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  private _dialogs = inject(DialogsService);
  private _api = inject(KeywordPackagesService);

  deleteFunctionPackage(id: string, name: string): Observable<boolean> {
    return this._dialogs.showDeleteWarning(1, `Keyword Package "${name}"`).pipe(
      filter((result) => result),
      switchMap(() => this._api.deleteFunctionPackage(id)),
    );
  }
}
