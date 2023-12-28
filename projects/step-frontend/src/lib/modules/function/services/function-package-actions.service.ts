import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogsService,
  EditorResolverService,
  FunctionPackage,
  KeywordPackagesService,
  MultipleProjectsService,
} from '@exense/step-core';
import { filter, Observable, of, switchMap, take } from 'rxjs';
import { FunctionPackageConfigurationDialogComponent } from '../components/function-package-configuration-dialog/function-package-configuration-dialog.component';
import { FunctionPackageConfigurationDialogData } from '../types/function-package-configuration-dialog-data.interface';

const FUNCTION_PACKAGE_ID = 'functionPackageId';

@Injectable({
  providedIn: 'root',
})
export class FunctionPackageActionsService {
  private _multipleProjects = inject(MultipleProjectsService);
  private _editorResolver = inject(EditorResolverService);
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _api = inject(KeywordPackagesService);

  openAddFunctionPackageDialog(): Observable<FunctionPackage | boolean> {
    return this.openModal();
  }

  editFunctionPackage(functionPackage: FunctionPackage): Observable<FunctionPackage | boolean> {
    if (this._multipleProjects.isEntityBelongsToCurrentProject(functionPackage)) {
      return this.editFunctionPackageInternal(functionPackage.id!);
    }

    const url = `/functionPackages`;
    const editParams = { [FUNCTION_PACKAGE_ID]: functionPackage.id! };

    return this._multipleProjects
      .confirmEntityEditInASeparateProject(functionPackage, { url, search: editParams }, 'keyword package')
      .pipe(
        switchMap((continueEdit) => {
          if (continueEdit) {
            return this.editFunctionPackageInternal(functionPackage.id!);
          }
          return of(continueEdit);
        })
      );
  }

  deleteFunctionPackage(id: string, name: string): Observable<boolean> {
    return this._dialogs.showDeleteWarning(1, `Keyword Package "${name}"`).pipe(
      filter((result) => result),
      switchMap(() => this._api.deleteFunctionPackage(id))
    );
  }

  resolveEditLinkIfExists(): void {
    this._editorResolver
      .onEditEntity(FUNCTION_PACKAGE_ID)
      .pipe(
        take(1),
        switchMap((functionPackageId) => this.editFunctionPackageInternal(functionPackageId))
      )
      .subscribe();
  }

  private editFunctionPackageInternal(id: string): Observable<FunctionPackage | boolean> {
    return this._api.getFunctionPackage(id).pipe(switchMap((response) => this.openModal(response)));
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
