import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  AJS_LOCATION,
  ControllerService,
  DialogsService,
  LinkProcessorService,
  Mutable,
  ReportNode,
} from '@exense/step-core';
import { forkJoin, from, map, switchMap } from 'rxjs';
import { ILocationService } from 'angular';
import { ReportNodeType } from '../../shared/report-node-type.enum';

type FieldAccessor = Mutable<Pick<ReportNodeComponent, 'node' | 'children'>>;

@Component({
  selector: 'step-report-node',
  templateUrl: './report-node.component.html',
  styleUrls: ['./report-node.component.scss'],
})
export class ReportNodeComponent implements OnChanges {
  @Input() reportNodeId?: string;

  @Input() showArtefact: boolean = false;
  @Output() showArtefactChange = new EventEmitter<boolean>();

  readonly ReportNodeType = ReportNodeType;

  readonly node?: ReportNode;
  readonly children: ReportNode[] = [];

  hideSource: boolean = false;

  constructor(
    private _api: ControllerService,
    private _linkProcessor: LinkProcessorService,
    private _dialogs: DialogsService,
    @Inject(AJS_LOCATION) private _location$: ILocationService
  ) {}

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
        switchMap((plan) => {
          const node = this.node;
          return from(this._linkProcessor.process(plan?.attributes?.['project'])).pipe(map(() => ({ node, plan })));
        })
      )
      .subscribe({
        next: ({ node, plan }) => {
          this._location$.search('artefactId', node!.artefactID!);
          this._location$.path(`/root/plans/editor/${plan.id}`);
        },
        error: (errorMessage) => {
          if (!errorMessage) {
            return;
          }
          console.error('reportNodes.openPlan', errorMessage);
          this._dialogs.showErrorMsg(errorMessage);
        },
      });
  }

  private loadReportNode(id?: string): void {
    const fieldAccessor = this as FieldAccessor;

    if (!id) {
      fieldAccessor.node = undefined;
      fieldAccessor.children = [];
      return;
    }

    forkJoin({
      node: this._api.getReportNode(id),
      children: this._api.getReportNodeChildren(id),
    }).subscribe(({ node, children }) => {
      fieldAccessor.node = node;
      fieldAccessor.children = children;
    });
  }
}
