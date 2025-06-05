import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonEntitiesUrlsService, ControllerService, DialogsService, ReportNode } from '@exense/step-core';

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

  protected readonly _activatedRoute = inject(ActivatedRoute);
  private reportNode$ = this._activatedRoute.parent!.data.pipe(
    map((data) => data['reportNode'] as ReportNode),
    switchMap((node) => {
      if (!!node) {
        return of(node);
      }
      const nodeId = this._activatedRoute.snapshot.queryParams['reportNodeId'];
      return this._api.getReportNode(nodeId).pipe(catchError(() => of(undefined)));
    }),
  );

  protected readonly reportNode = toSignal(this.reportNode$);
  protected readonly artefact = computed(() => this.reportNode()?.resolvedArtefact);

  protected openPlan(): void {
    const node = this.reportNode();
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
        switchMap((url) => this._router.navigateByUrl(url)),
        catchError((errorMessage) => {
          if (errorMessage) {
            console.error('reportNodes.openPlan', errorMessage);
            this._dialogs.showErrorMsg(errorMessage).subscribe();
          }
          return of(false);
        }),
      )
      .subscribe();
  }
}
