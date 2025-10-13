import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, filter, switchMap } from 'rxjs';
import { Resource, ResourcesService } from '../../../client/step-client-module';
import { SearchResourceDialogComponent } from '../components/search-resource-dialog/search-resource-dialog.component';
import { UpdateResourceWarningDialogComponent } from '../components/update-resource-warning-dialog/update-resource-warning-dialog.component';
import { UpdateResourceWarningResultState } from '../types/update-resource-warning-result-state.enum';
import { DialogsService } from '../../basics/step-basics.module';
import { IsUsedByDialogService } from '../../is-used-by';

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

  deleteResource(id: string, label: string): Observable<boolean> {
    return this._dialogs.showDeleteWarning(1, `Resource "${label}"`).pipe(
      filter((result) => result),
      switchMap(() => this._resourcesService.deleteResource(id)),
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

  showUpdateResourceWarning(): Observable<UpdateResourceWarningResultState | undefined> {
    return this._matDialog
      .open<
        UpdateResourceWarningDialogComponent,
        null,
        UpdateResourceWarningResultState | undefined
      >(UpdateResourceWarningDialogComponent)
      .afterClosed();
  }
}
