import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControllerService, DialogsService, PlanUrlPipe, ReportNode } from '@exense/step-core';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ReportNodeType } from '../../shared/report-node-type.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'step-report-node',
  templateUrl: './report-node.component.html',
  styleUrls: ['./report-node.component.scss'],
})
export class ReportNodeComponent implements OnChanges {
  private _api = inject(ControllerService);
  private _dialogs = inject(DialogsService);
  private _router = inject(Router);

  @Input() reportNodeId?: string;

  @Input() showArtefact: boolean = false;
  @Output() showArtefactChange = new EventEmitter<boolean>();

  readonly ReportNodeType = ReportNodeType;

  protected node?: ReportNode;
  protected children: ReportNode[] = [];

  hideSource: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cReportNodeId = changes['reportNodeId'];
    if (cReportNodeId?.previousValue !== cReportNodeId?.currentValue || cReportNodeId?.firstChange) {
      this.loadReportNode(cReportNodeId?.currentValue);
    }
  }

  toggleShowArtefact(): void {
    this.showArtefact = !this.showArtefact;
    this.showArtefactChange.emit(this.showArtefact);
  }

  openPlan(): void {
    if (!this.node) {
      return;
    }
    this._api
      .getReportNodeRootPlan(this.node!.id!)
      .pipe(
        switchMap((plan) => this._router.navigateByUrl(PlanUrlPipe.transform(plan)!)),
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

  private loadReportNode(id?: string): void {
    if (!id) {
      this.node = undefined;
      this.children = [];
      return;
    }

    forkJoin({
      node: this._api.getReportNode(id),
      children: this._api.getReportNodeChildren(id),
    }).subscribe(({ node, children }) => {
      this.node = node;
      this.children = children.filter((child) => child.resolvedArtefact !== null);
    });
  }
}
