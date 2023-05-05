import { inject, Injectable } from '@angular/core';
import { a1Promise2Observable, DialogsService, FunctionPackage, KeywordPackagesService } from '@exense/step-core';
import { map, Observable, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FunctionPackageConfigurationDialogComponent } from '../components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageConfigurationDialogData } from '../types/function-package-configuration-dialog-data.interface';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _api = inject(KeywordPackagesService);

  private openModal(functionPackage?: FunctionPackage, packageId?: string): Observable<FunctionPackage | boolean> {
    return this._matDialog
      .open(FunctionPackageConfigurationDialogComponent, {
        data: {
          packageId,
          functionPackage,
        } as FunctionPackageConfigurationDialogData,
      })
      .afterClosed();
  }

  openAddFunctionPackageDialog(): Observable<FunctionPackage | boolean> {
    return this.openModal();
  }

  editFunctionPackage(id: string): Observable<FunctionPackage | boolean> {
    return this._api.getFunctionPackage(id).pipe(switchMap((response) => this.openModal(response, id)));
  }

  deleteFunctionPackage(id: string, name: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Keyword Package "${name}"`)).pipe(
      switchMap((_) => this._api.deleteFunctionPackage(id)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }
}
