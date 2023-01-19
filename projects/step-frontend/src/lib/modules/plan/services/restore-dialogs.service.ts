import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DialogsService, PlansService, UibModalHelperService } from '@exense/step-core';
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
    private _plansService: PlansService,
    private _matDialog: MatDialog
  ) {}

  restoreVersion(versionId: string) {
    const planId = 'create me';
    this._plansService.restorePlanVersion(planId, versionId);
  }

  showRestoreDialog(planId: string, versionId: string): Observable<string> {
    const dialogRef = this._matDialog.open(RestoreDialogComponent, { data: { id: planId, version: versionId } });
    return dialogRef.afterClosed() as Observable<string>;
  }
}
