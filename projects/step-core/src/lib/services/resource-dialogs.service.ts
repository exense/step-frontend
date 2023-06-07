import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { a1Promise2Observable, DialogsService } from '../shared';
import { ResourcesService } from '../client/generated';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { UibModalHelperService } from './uib-modal-helper.service';
import { ResourceInputBridgeService } from './resource-input-bridge.service';
import { Resource } from '../client/generated';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { SearchResourceDialogComponent } from '../components/search-resource-dialog/search-resource-dialog.component';
import { FileAlreadyExistingDialogComponent } from '../components/file-already-existing-dialog/file-already-existing-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ResourceDialogsService {
  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

  private _uibModalHelper = inject(UibModalHelperService);
  private _dialogs = inject(DialogsService);
  private _resourcesService = inject(ResourcesService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _matDialog = inject(MatDialog);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  editResource(resource?: Partial<Resource>): Observable<{ resource?: Partial<Resource>; result: string } | boolean> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/editResourceDialog.html',
      controller: 'editResourceCtrl',
      resolve: {
        id: function () {
          return resource?.id;
        },
      },
    });

    const result$ = a1Promise2Observable(modalInstance.result) as Observable<string>;

    return result$.pipe(
      map((result) => {
        return {
          result,
          resource,
        };
      }),
      catchError(() => {
        this._resourceInputBridgeService.deleteLastUploadedResource();

        return of(false);
      })
    );
  }

  deleteResource(id: string, label: string): Observable<any> {
    return a1Promise2Observable(this._dialogs.showDeleteWarning(1, `Resource "${label}"`)).pipe(
      switchMap((_) => this._resourcesService.deleteResource(id)),
      map((_) => true),
      catchError((_) => of(false))
    );
  }

  searchResource(resource: Resource): void {
    this._isUsedByDialogs.displayDialog(resource.resourceName || '', this.RESOURCE_SEARCH_TYPE, resource.id!);
  }

  showSearchResourceDialog(type: string): Observable<string> {
    const dialogRef = this._matDialog.open(SearchResourceDialogComponent, { data: type });
    return dialogRef.afterClosed() as Observable<string>;
  }

  showFileAlreadyExistsWarning(similarResources: Resource[]): Observable<{ id?: string } | undefined> {
    return this._matDialog
      .open<FileAlreadyExistingDialogComponent, Resource[], { id?: string }>(FileAlreadyExistingDialogComponent, {
        data: similarResources,
      })
      .afterClosed();
  }

  showUpdateResourceWarning(resource?: Resource): Observable<boolean> {
    const modalInstance = this._uibModalHelper.open({
      backdrop: 'static',
      templateUrl: 'partials/resources/updateResourceWarning.html',
      controller: 'updateResourceWarningCtrl',
      resolve: {
        resource: () => {
          return resource;
        },
      },
    });

    return a1Promise2Observable(modalInstance.result) as Observable<boolean>;
  }
}
