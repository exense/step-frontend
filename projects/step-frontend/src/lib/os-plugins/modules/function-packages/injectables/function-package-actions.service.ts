import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogsService, FunctionPackage, KeywordPackagesService } from '@exense/step-core';
import { filter, Observable, switchMap } from 'rxjs';
import { FunctionPackageConfigurationDialogComponent } from '../components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageConfigurationDialogData } from '../types/function-package-configuration-dialog-data.interface';

const ROOT_URL = '/function-packages';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _api = inject(KeywordPackagesService);

  openAddFunctionPackageDialog(): Observable<FunctionPackage | boolean> {
    return this.openModal();
  }

  deleteFunctionPackage(id: string, name: string): Observable<boolean> {
    return this._dialogs.showDeleteWarning(1, `Keyword Package "${name}"`).pipe(
      filter((result) => result),
      switchMap(() => this._api.deleteFunctionPackage(id)),
    );
  }

  private openModal(functionPackage?: FunctionPackage): Observable<FunctionPackage | boolean> {
    return this._matDialog
      .open(FunctionPackageConfigurationDialogComponent, {
        data: {
          functionPackage,
        } as FunctionPackageConfigurationDialogData,
      })
      .afterClosed();
  }
}
