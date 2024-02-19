import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AbstractArtefact, Bookmark } from '../client/step-client-module';
import { ThreadDistributionWizardDialogComponent } from '../components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
import { EntityActionInvokerService } from '../modules/entity/entity.module';
import { PlanAction } from '../shared';

@Injectable({
  providedIn: 'root',
})
export class BookmarkDialogsService {
  private _entityActionsInvoker = inject(EntityActionInvokerService);
  private _matDialog = inject(MatDialog);

  openThreadGroupDistributionWizard(artefact: AbstractArtefact): Observable<AbstractArtefact | undefined> {
    return this._matDialog.open(ThreadDistributionWizardDialogComponent, { data: artefact }).afterClosed();
  }

  deleteBookmark(bookmark: Bookmark): Observable<boolean> {
    return this._entityActionsInvoker.invokeAction('dashboards', PlanAction.DELETE, bookmark);
  }
}
