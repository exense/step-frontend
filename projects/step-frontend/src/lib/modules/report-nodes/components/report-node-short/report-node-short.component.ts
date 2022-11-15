import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TrackByFunction } from '@angular/core';
import {
  ArtefactTypesService,
  ControllerService,
  Mutable,
  ReportNode,
  ReportNodeCommonsService,
} from '@exense/step-core';

export interface ReportNodeAddon {
  functionAttributes?: Record<string, string>;
  input?: string | null;
  output?: string | null;
  echo?: string;
  message?: string;
  key?: string;
  value?: string;
  agentUrl?: string;
}

type FieldsAccessor = Mutable<Pick<ReportNodeShortComponent, 'headerText' | 'reportNodeId' | 'children'>>;

@Component({
  selector: 'step-report-node-short',
  templateUrl: './report-node-short.component.html',
  styleUrls: ['./report-node-short.component.scss'],
})
export class ReportNodeShortComponent implements OnChanges {
  @Input() node?: ReportNode & ReportNodeAddon;
  @Input() includeStatus: boolean = false;
  @Input() showDetails: boolean = false;
  @Input() showFooter: boolean = false;
  @Input() isShowNodeInTreeVisible: boolean = true;
  @Input() isShowTestCaseVisible: boolean = false;

  @Output() showNodeInTree = new EventEmitter<string>();
  @Output() showTestCase = new EventEmitter<string>();

  hideInput: boolean = false;
  hideOutput: boolean = false;

  readonly headerText: string = '';
  readonly reportNodeId: string = '';
  readonly children?: ReportNode[];

  readonly trackByReportNode: TrackByFunction<ReportNode> = (index, item) => item.id;

  constructor(
    private _artefactTypes: ArtefactTypesService,
    private _reportNodeCommons: ReportNodeCommonsService,
    private _controllerService: ControllerService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cNode = changes['node'];
    if (cNode?.previousValue !== cNode?.currentValue || cNode?.firstChange) {
      this.determineHeader(cNode?.currentValue);
      this.setupReportNodeId(cNode?.currentValue);
      this.loadChildren(cNode?.currentValue);
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  toggleInput(): void {
    this.hideInput = !this.hideInput;
  }

  toggleOutput(): void {
    this.hideOutput = !this.hideOutput;
  }

  private determineHeader(node?: ReportNode & ReportNodeAddon): void {
    if (!node) {
      (this as FieldsAccessor).headerText = '';
      return;
    }
    if (node!.resolvedArtefact!._class === 'CallKeyword') {
      (this as FieldsAccessor).headerText = this.concatenate(node.functionAttributes);
    } else {
      (this as FieldsAccessor).headerText = this._artefactTypes.getLabel(node!.resolvedArtefact!._class);
    }
  }

  private setupReportNodeId(node?: ReportNode): void {
    (this as FieldsAccessor).reportNodeId = node?.id || '';
  }

  private loadChildren(node?: ReportNode): void {
    if (node?.status !== 'FAILED') {
      (this as FieldsAccessor).children = undefined;
      return;
    }

    this._controllerService.getReportNodeChildren(node!.id!).subscribe((children) => {
      (this as FieldsAccessor).children = children.filter(
        (child) =>
          (child._class === 'step.artefacts.reports.AssertReportNode' ||
            child._class === 'step.artefacts.reports.PerformanceAssertReportNode') &&
          child.status !== 'PASSED'
      );
    });
  }

  private concatenate(attributesMap?: Record<string, string>): string {
    if (!attributesMap) {
      return '';
    }
    const functionAttributes = this._reportNodeCommons.getFunctionAttributes();

    const result = functionAttributes
      .map((key) => {
        const realKey = key?.id?.replace('attributes.', '');
        const attributeValue = !!realKey ? attributesMap[realKey] : undefined;
        return attributeValue || '';
      })
      .filter((x) => !!x)
      .join('.');

    return result;
  }
}
