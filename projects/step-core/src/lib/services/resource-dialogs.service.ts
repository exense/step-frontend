import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Resource, ResourcesService } from '../client/generated';
import { SearchResourceDialogComponent } from '../components/search-resource-dialog/search-resource-dialog.component';
import { a1Promise2Observable, DialogsService } from '../shared';
import { UpdateResourceWarningResultState } from '../shared/update-resource-warning-result-state.enum';
import { UpdateResourceWarningDialogComponent } from '../step-core.module';
import { IsUsedByDialogService } from './is-used-by-dialog.service';
import { ResourceInputBridgeService } from './resource-input-bridge.service';
import { UibModalHelperService } from './uib-modal-helper.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { SearchResourceDialogComponent } from '../components/search-resource-dialog/search-resource-dialog.component';
import { FileAlreadyExistingDialogComponent } from '../components/file-already-existing-dialog/file-already-existing-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ResourceDialogsService {
  private _matDialog = inject(MatDialog);
  private _dialogs = inject(DialogsService);
  private _resourcesService = inject(ResourcesService);
  private _uibModalHelper = inject(UibModalHelperService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

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

  showUpdateResourceWarning(): Observable<UpdateResourceWarningResultState | undefined> {
    return this._matDialog
      .open<UpdateResourceWarningDialogComponent, null, UpdateResourceWarningResultState | undefined>(
        UpdateResourceWarningDialogComponent
      )
      .afterClosed();
  }
}
