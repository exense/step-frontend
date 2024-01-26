import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AugmentedAutomationPackagesService,
  AutomationPackage,
  DialogsService,
  EditorResolverService,
  MultipleProjectsService,
} from '@exense/step-core';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { AutomationPackageUploadDialogComponent } from '../components/automation-package-upload-dialog/automation-package-upload-dialog.component';
import { ENTITY_ID, PATH } from '../types/constants';

const AUTOMATION_PACKAGE_ID = 'automationPackageId';

@Injectable({
  providedIn: 'root',
})
export class AutomationPackagesDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _api = inject(AugmentedAutomationPackagesService);
  private _editorResolver = inject(EditorResolverService);
  private _multipleProjects = inject(MultipleProjectsService);

  deleteAutomationPackage(automationPackage: AutomationPackage): Observable<boolean> {
    const id = automationPackage.id;
    if (!id) {
      return of(false);
    }
    const name = automationPackage.attributes?.['name'];

    return this._dialogs.showDeleteWarning(1, `Automation package "${name ?? id}"`).pipe(
      switchMap((isDeleteConfirmed) => {
        if (isDeleteConfirmed) {
          return this._api.deleteAutomationPackage(id).pipe(map(() => true));
        }
        return of(isDeleteConfirmed);
      })
    );
  }

  createAutomationPackage(): Observable<boolean> {
    return this.openAutomationPackageEditDialog();
  }

  editAutomationPackage(automationPackage: AutomationPackage): Observable<boolean> {
    if (this._multipleProjects.isEntityBelongsToCurrentProject(automationPackage)) {
      return this.openAutomationPackageEditDialog(automationPackage);
    }

    const url = `/${PATH}/list`;
    const editParams = { [AUTOMATION_PACKAGE_ID]: automationPackage.id! };

    return this._multipleProjects
      .confirmEntityEditInASeparateProject(automationPackage, { url, search: editParams }, ENTITY_ID)
      .pipe(
        switchMap((continueEdit) => {
          if (continueEdit) {
            return this.openAutomationPackageEditDialog(automationPackage);
          }
          return of(continueEdit);
        })
      );
  }

  resolveEditLinkIfExists(): Observable<boolean> {
    return this._editorResolver.onEditEntity(AUTOMATION_PACKAGE_ID).pipe(
      take(1),
      switchMap((id) => this._api.getAutomationPackage(id)),
      switchMap((automationPackage) => this.openAutomationPackageEditDialog(automationPackage))
    );
  }

  private openAutomationPackageEditDialog(automationPackage?: AutomationPackage): Observable<boolean> {
    return this._matDialog
      .open<AutomationPackageUploadDialogComponent, AutomationPackage | undefined, boolean>(
        AutomationPackageUploadDialogComponent,
        { data: automationPackage }
      )
      .afterClosed()
      .pipe(map((result) => !!result));
  }
}
