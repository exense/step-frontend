import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogsService, FunctionPackage, KeywordPackagesService, MultipleProjectsService } from '@exense/step-core';
import { filter, Observable, switchMap } from 'rxjs';
import { FunctionPackageConfigurationDialogComponent } from '../components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageConfigurationDialogData } from '../types/function-package-configuration-dialog-data.interface';
import { Router } from '@angular/router';

const ROOT_URL = '/root/functionPackages';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  private _multipleProjects = inject(MultipleProjectsService);
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _api = inject(KeywordPackagesService);
  private _router = inject(Router);

  readonly rootUrl = ROOT_URL;

  openAddFunctionPackageDialog(): Observable<FunctionPackage | boolean> {
    return this.openModal();
  }

  newFunctionPackage(): void {
    this._router.navigateByUrl(`${ROOT_URL}/editor/new`);
  }

  editFunctionPackage(functionPackage: FunctionPackage): void {
    const url = `${ROOT_URL}/editor/${functionPackage.id}`;
    if (this._multipleProjects.isEntityBelongsToCurrentProject(functionPackage)) {
      this._router.navigateByUrl(url);
      return;
    }

    this._multipleProjects
      .confirmEntityEditInASeparateProject(functionPackage, url, 'keyword package')
      .subscribe((continueEdit) => {
        if (continueEdit) {
          this._router.navigateByUrl(url);
        }
      });
  }

  deleteFunctionPackage(id: string, name: string): Observable<boolean> {
    return this._dialogs.showDeleteWarning(1, `Keyword Package "${name}"`).pipe(
      filter((result) => result),
      switchMap(() => this._api.deleteFunctionPackage(id))
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
