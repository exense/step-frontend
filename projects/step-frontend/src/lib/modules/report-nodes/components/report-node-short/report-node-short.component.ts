import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import {
  ArtefactService,
  ControllerService,
  Mutable,
  ReportNode,
  ReportNodeExt,
  ViewerFormat,
} from '@exense/step-core';
import { ReportNodeCommonsService } from '../../services/report-node-commons.service';
import { map, Observable, of } from 'rxjs';

type FieldsAccessor = Mutable<Pick<ReportNodeShortComponent, 'headerText' | 'reportNodeId' | 'children'>>;

@Component({
  selector: 'step-report-node-short',
  templateUrl: './report-node-short.component.html',
  styleUrls: ['./report-node-short.component.scss'],
})
export class ReportNodeShortComponent implements OnChanges {
  private _artefactTypes = inject(ArtefactService);
  private _reportNodeCommons = inject(ReportNodeCommonsService);
  private _controllerService = inject(ControllerService);

  @Input() node?: ReportNodeExt;
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
  readonly ViewerFormat = ViewerFormat;

  readonly trackByReportNode: TrackByFunction<ReportNode> = (index, item) => item.id;

  ngOnChanges(changes: SimpleChanges): void {
    const cNode = changes['node'];
    if (cNode?.previousValue !== cNode?.currentValue || cNode?.firstChange) {
      this.determineHeader(cNode?.currentValue);
      this.setupReportNodeId(cNode?.currentValue);
      this.loadChildren(cNode?.currentValue);
    }
  }

  toggleInput(): void {
    this.hideInput = !this.hideInput;
  }

  toggleOutput(): void {
    this.hideOutput = !this.hideOutput;
  }

  private determineHeader(node?: ReportNodeExt): void {
    if (!node) {
      (this as FieldsAccessor).headerText = '';
      return;
    }
    if (node!.resolvedArtefact?._class === 'CallKeyword') {
      this.concatenate(node.functionAttributes).subscribe((value) => {
        (this as FieldsAccessor).headerText = value;
      });
    } else {
      (this as FieldsAccessor).headerText =
        this._artefactTypes.getArtefactType(node!.resolvedArtefact?._class)?.label ?? '';
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
          child.status !== 'PASSED',
      );
    });
  }

  private concatenate(attributesMap?: Record<string, string>): Observable<string> {
    if (!attributesMap) {
      return of('');
    }

    const result$ = this._reportNodeCommons.getFunctionAttributes().pipe(
      map((attributes) =>
        attributes
          .map((attribute) => {
            const realKey = attribute?.id?.replace('attributes.', '');
            const attributeValue = !!realKey ? attributesMap[realKey] : undefined;
            return attributeValue || '';
          })
          .filter((x) => !!x)
          .join('.'),
      ),
    );

    return result$;
  }
}
