import {
  AfterViewInit,
  Component,
  inject,
  input,
  output,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AggregatedReportView,
  Operation,
  ReportNode,
  STORE_ALL,
  TableIndicatorMode,
  TableMemoryStorageService,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableSearch,
  TableStorageService,
} from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';
import { AGGREGATED_TREE_WIDGET_STATE } from '../../services/aggregated-report-view-tree-state.service';
import { AltReportNodeListSearchDirective } from '../../directives/alt-report-node-list-search.directive';
import { VIEW_MODE } from '../../shared/view-mode';
import { Status } from '../../../_common/shared/status.enum';
import { AltReportNodeListItemsPerPageDirective } from '../../directives/alt-report-node-list-items-per-page.directive';
import { OPEN_EXECUTION_DETAILS_TOOLTIP } from '../../shared/open-execution-details-tooltip';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { TestCasesDisplayMode } from '../../shared/test-cases-display-mode';
import { toSignal } from '@angular/core/rxjs-interop';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';

@Component({
  selector: 'step-alt-report-node-testcases',
  templateUrl: './alt-report-node-testcases.component.html',
  styleUrl: './alt-report-node-testcases.component.scss',
  standalone: false,
  providers: [
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('testCases', STORE_ALL),
  ],
  hostDirectives: [AltReportNodeListSearchDirective, AltReportNodeListItemsPerPageDirective],
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeTestcasesComponent implements AfterViewInit {
  protected readonly _state = inject(AltReportNodesStateService);
  private _treeState = inject(AGGREGATED_TREE_WIDGET_STATE);
  private _executionState = inject(AltExecutionStateService);
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _listSearch = inject(AltReportNodeListSearchDirective, { self: true });
  protected readonly _mode = inject(VIEW_MODE);

  readonly openIterations = output<OpenIterationsEvent>();

  protected readonly tableSearch = viewChild('table', { read: TableSearch });
  readonly selectedId = input<string | undefined>(undefined);
  protected readonly detailsTooltip = OPEN_EXECUTION_DETAILS_TOOLTIP;
  protected readonly testCasesDisplayMode = toSignal(this._executionState.testCasesDisplayMode$, {
    initialValue: TestCasesDisplayMode.AGGREGATED,
  });
  protected readonly testCasesTableParameters$ = this._executionState.testCasesTableParameters$;

  private get tableSearchUntracked(): TableSearch | undefined {
    return untracked(() => this.tableSearch());
  }

  ngAfterViewInit(): void {
    this._listSearch.searchNameOrErrors$.subscribe((searchValue) =>
      this.tableSearchUntracked?.onSearch?.('nameOrErrors', searchValue, false),
    );
    this._listSearch.searchStatuses$.subscribe((status) => this.tableSearchUntracked?.onSearch?.('status', status));
    this._listSearch.searchReportNodeClass$.subscribe((reportNodeClass) =>
      this.tableSearchUntracked?.onSearch?.('_class', reportNodeClass),
    );
    this._listSearch.searchDateRange$.subscribe(({ searchValue, params }) => {
      if (typeof searchValue === 'string') {
        this.tableSearchUntracked?.onSearch?.('executionTime', searchValue, true, params);
      } else {
        this.tableSearchUntracked?.onSearch?.('executionTime', searchValue, params);
      }
    });
  }

  protected onSearchFor(item: AggregatedReportView, message: string): void {
    this.showIterations(item, { searchFor: message });
  }

  protected asAggregatedReportView(item: AggregatedReportView | ReportNode): AggregatedReportView {
    return item as AggregatedReportView;
  }

  protected asReportNode(item: AggregatedReportView | ReportNode): ReportNode {
    return item as ReportNode;
  }

  protected currentOperations(item: AggregatedReportView | null | undefined): Operation[] {
    return item?.currentOperations ?? [];
  }

  protected openIterationDetails(item: ReportNode): void {
    this._executionDialogs.openIterationDetails(DrilldownRootType.TESTCASES, item);
  }

  protected iterationErrorMessage(item: ReportNode | null | undefined): string | undefined {
    return item?.error?.msg?.trim() || undefined;
  }

  protected isSelected(id: string | null | undefined): boolean {
    const selectedId = this.selectedId();
    return !!selectedId && id === selectedId;
  }

  protected showIterations(
    item: AggregatedReportView,
    options?: { searchFor?: string; status?: Status; count?: number; event?: MouseEvent },
  ): void {
    options?.event?.stopPropagation?.();
    options?.event?.stopImmediatePropagation?.();

    const artefactId = item.artefact!.id!;

    const node = this._treeState
      .findNodesByArtefactId(artefactId)
      .find((node) => node.artefactHash === item.artefactHash);

    if (!node) {
      return;
    }

    if (options && !options?.count) {
      options!.count = Object.values(item.countByStatus ?? {}).reduce((res, item) => res + item, 0);
    }

    this.openIterations.emit({
      node,
      restParams: {
        nodeStatus: options?.status,
        nodeStatusCount: options?.count,
        searchFor: options?.searchFor,
      },
    });
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
  protected readonly TestCasesDisplayMode = TestCasesDisplayMode;
}
