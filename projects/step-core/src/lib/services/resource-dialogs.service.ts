import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogsService,
  FileAlreadyExistingDialogComponent,
  FileAlreadyExistingDialogData,
  IsUsedByDialogService,
  Resource,
  ResourceInputBridgeService,
  ResourcesService,
  SearchResourceDialogComponent,
  a1Promise2Observable,
} from '@exense/step-core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ResourceConfigurationDialogData } from '../components/resource-configuration-dialog/resource-configuration-dialog-data.interface';
import { ResourceConfigurationDialogComponent } from '../components/resource-configuration-dialog/resource-configuration-dialog.component';
import { UpdateResourceWarningDialogComponent } from '../components/update-resource-warning-dialog/update-resource-warning-dialog.component';
import { UpdateResourceWarningResultState } from '../shared/update-resource-warning-result-state.enum';

const RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

@Injectable({
  providedIn: 'root',
})
export class ResourceDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _resourcesService = inject(ResourcesService);
  private _document = inject(DOCUMENT);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  editResource(resource?: Resource): Observable<Resource | undefined> {
    const matDialogRef = this._matDialog.open<
      ResourceConfigurationDialogComponent,
      ResourceConfigurationDialogData,
      Resource | undefined
    >(ResourceConfigurationDialogComponent, {
      data: {
        resource,
      },
    });

    return matDialogRef.beforeClosed().pipe(
      tap((updatedResource) => {
        if (updatedResource) {
          return;
        }

        this._resourceInputBridgeService.deleteLastUploadedResource();
      }),
      switchMap(() => matDialogRef.afterClosed())
    );
  }

  deleteResource(id: string, label: string): Observable<boolean> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Resource "${label}"`)).pipe(
      switchMap(() => this._resourcesService.deleteResource(id)),
      map(() => true),
      catchError(() => of(false))
    );
  }

  searchResource(resource: Resource): void {
    this._isUsedByDialogs.displayDialog(resource.resourceName || '', RESOURCE_SEARCH_TYPE, resource.id!);
  }

  showSearchResourceDialog(type: string): Observable<string> {
    const dialogRef = this._matDialog.open(SearchResourceDialogComponent, { data: type });
    return dialogRef.afterClosed() as Observable<string>;
  }

  downloadResource(id: string): void {
    const url = `rest/resources/${id}/content`;
    this._document.defaultView!.open(url, '_blank');
  }

  showFileAlreadyExistsWarning(similarResources: Resource[]): Observable<string | undefined> {
    return this._matDialog
      .open<FileAlreadyExistingDialogComponent, FileAlreadyExistingDialogData, string | undefined>(
        FileAlreadyExistingDialogComponent,
        {
          data: {
            similarResources,
          },
        }
      )
      .afterClosed();
  }

  showUpdateResourceWarning(): Observable<UpdateResourceWarningResultState | undefined> {
    return this._matDialog
      .open<UpdateResourceWarningDialogComponent, null, UpdateResourceWarningResultState | undefined>(
        UpdateResourceWarningDialogComponent
      )
      .afterClosed();
  }
}
