import { Component, inject, input, model } from '@angular/core';
import { ControllerService, DialogsService, ReportNode, CommonEntitiesUrlsService } from '@exense/step-core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ReportNodeType } from '../../shared/report-node-type.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'step-report-node',
  templateUrl: './report-node.component.html',
  styleUrls: ['./report-node.component.scss'],
  standalone: false,
})
export class ReportNodeComponent {
  private _api = inject(ControllerService);
  private _dialogs = inject(DialogsService);
  private _router = inject(Router);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  readonly reportNodeId = input<string | undefined>(undefined);

  readonly showArtefact = model(false);

  readonly ReportNodeType = ReportNodeType;

  protected node?: ReportNode;
  protected children: ReportNode[] = [];

  hideSource: boolean = false;

  private readonly loadReportNode$ = toObservable(this.reportNodeId).pipe(
    map((id) => {
      this.node = undefined;
      this.children = [];
      return id;
    }),
    switchMap((id) => {
      if (!id) {
        return of({ node: undefined, children: [] as ReportNode[] });
      }

      return forkJoin({
        node: this._api.getReportNode(id),
        children: this._api.getReportNodeChildren(id),
      }).pipe(catchError(() => of({ node: undefined, children: [] as ReportNode[] })));
    }),
    takeUntilDestroyed(),
  );

  private readonly loadReportNodeSubscription = this.loadReportNode$.subscribe(({ node, children }) => {
    if (!node) {
      return;
    }
    this.node = node;
    this.children = children.filter((child) => child.resolvedArtefact !== null);
  });

  toggleShowArtefact(): void {
    this.showArtefact.update((value) => !value);
  }

  openPlan(): void {
    if (!this.node) {
      return;
    }
    this._api
      .getReportNodeRootPlan(this.node!.id!)
      .pipe(
        switchMap((plan) => {
          if (!plan) {
            throw `Plan for current report node doesn't exist.`;
          }
          return this._router.navigateByUrl(
            this._commonEntitiesUrls.planEditorUrl(plan)! + '?artefactId=' + this.node!.artefactID,
          );
        }),
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
