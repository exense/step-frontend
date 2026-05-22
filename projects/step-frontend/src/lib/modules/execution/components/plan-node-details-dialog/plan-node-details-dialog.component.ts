import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, from, map, of, switchMap } from 'rxjs';
import { CommonEntitiesUrlsService, ControllerService, DialogsService, ReportNode } from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PlanNodeDetailsDialogComponentData {
  reportNode: ReportNode;
}

@Component({
  selector: 'step-plan-node-details-dialog',
  templateUrl: './plan-node-details-dialog.component.html',
  styleUrl: './plan-node-details-dialog.component.scss',
  standalone: false,
})
export class PlanNodeDetailsDialogComponent {
  private _api = inject(ControllerService);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _router = inject(Router);
  private _dialogs = inject(DialogsService);
  private _dialogRef = inject(MatDialogRef);

  private _dialogData = inject<PlanNodeDetailsDialogComponentData>(MAT_DIALOG_DATA);
  protected readonly reportNode = this._dialogData.reportNode;
  protected readonly artefact = this.reportNode.resolvedArtefact;

  protected readonly _activatedRoute = inject(ActivatedRoute);

  protected closeDialog(): void {
    this._dialogRef.close();
  }

  protected openPlan(): void {
    const node = this.reportNode;
    if (!node) {
      return;
    }
    this._api
      .getReportNodeRootPlan(node.id!)
      .pipe(
        map((plan) => {
          if (!plan) {
            throw `Plan for current report node doesn't exist.`;
          }
          let url = this._commonEntitiesUrls.planEditorUrl(plan)!;
          url = `${url}?artefactId=${node.artefactID!}`;
          return url;
        }),
        switchMap((url) => from(this._router.navigateByUrl(url))),
        catchError((errorMessage) => {
          if (errorMessage) {
            console.error('reportNodes.openPlan', errorMessage);
            this._dialogs.showErrorMsg(errorMessage).subscribe();
          }
          return of(false);
        }),
      )
      .subscribe((isSuccess) => {
        if (isSuccess) {
          this.closeDialog();
        }
      });
  }
}
