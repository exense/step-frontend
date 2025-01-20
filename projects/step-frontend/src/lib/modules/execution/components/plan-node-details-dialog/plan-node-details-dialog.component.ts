import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControllerService, ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-plan-node-details-dialog',
  templateUrl: './plan-node-details-dialog.component.html',
  styleUrl: './plan-node-details-dialog.component.scss',
})
export class PlanNodeDetailsDialogComponent {
  private _api = inject(ControllerService);
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
}
