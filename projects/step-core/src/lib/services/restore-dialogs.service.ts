import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DialogsService } from '../shared';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RestoreDialogComponent } from '../components/restore-dialog/restore-dialog.component';
import { UibModalHelperService } from './uib-modal-helper.service';
import { PlansService, History } from '../client/generated';

@Injectable({
  providedIn: 'root',
})
export class RestoreDialogsService {
  readonly RESOURCE_SEARCH_TYPE = 'RESOURCE_ID';

  constructor(
    private _httpClient: HttpClient,
    private _uibModalHelper: UibModalHelperService,
    private _dialogs: DialogsService,
    private _plansService: PlansService,
    private _matDialog: MatDialog
  ) {}

  showRestoreDialog(versionId: string, versionHistory: Observable<History[]>): Observable<string> {
    const dialogRef = this._matDialog.open(RestoreDialogComponent, {
      data: { version: versionId, history: versionHistory },
    });
    return dialogRef.afterClosed() as Observable<string>;
  }
}
