import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DialogsService, ResourcesService, UibModalHelperService } from '@exense/step-core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RestoreDialogComponent } from '../components/restore-dialog/restore-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class RestoreDialogsService {
  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _restoreService: RestoreService,
    private _matDialog: MatDialog
  ) {}

  restoreVersion(id: string): Observable<any> {
    this._restoreService.restoreVersion(id);
  }

  showRestoreDialog(type: string): Observable<string> {
    const dialogRef = this._matDialog.open(RestoreDialogComponent, { data: type });
    return dialogRef.afterClosed() as Observable<string>;
  }
}
