import { Component, inject, output, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AggregatedReportView,
  ItemsPerPageService,
  Operation,
  ReportNode,
  STORE_ALL,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableSearch,
  TableStorageService,
  TableMemoryStorageService,
  TableIndicatorMode,
} from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { Status } from '../../../_common/shared/status.enum';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { AGGREGATED_TREE_WIDGET_STATE } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestCasesDisplayMode } from '../../shared/test-cases-display-mode';

@Component({
  selector: 'step-alt-report-nodes-testcases',
  templateUrl: './alt-report-nodes-testcases.component.html',
  styleUrl: './alt-report-nodes-testcases.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltTestCasesNodesStateService,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltReportNodesStateService,
    },
    {
      provide: ItemsPerPageService,
      useExisting: AltReportNodesTestcasesComponent,
    },
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('testCases', STORE_ALL),
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodesTestcasesComponent extends BaseAltReportNodeTableContentComponent {
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _treeState = inject(AGGREGATED_TREE_WIDGET_STATE);
  private _executionState = inject(AltExecutionStateService);

  protected readonly tableSearch = viewChild('table', { read: TableSearch });
  protected readonly testCasesParameters$ = this._executionState.testCasesTableParameters$;
  protected readonly displayMode = toSignal(this._executionState.testCasesDisplayMode$, {
    initialValue: TestCasesDisplayMode.AGGREGATED,
  });

  readonly openTestCaseInTreeView = output<ReportNode>();

  protected onSearchFor(item: AggregatedReportView, message: string): void {
    this.showIterations(item, { searchFor: message });
  }

  protected override setupDateRangeFilter(): void {
    // Empty implementation
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

    this._executionDialogs.openIterations(node, {
      nodeStatus: options?.status,
      nodeStatusCount: options?.count,
      searchFor: options?.searchFor,
    });
  }

  protected toggleDisplayMode(): void {
    this._executionState.toggleTestCasesDisplayMode();
  }

  protected asAggregatedReportView(item: AggregatedReportView | ReportNode): AggregatedReportView {
    return item as AggregatedReportView;
  }

  protected asReportNode(item: AggregatedReportView | ReportNode): ReportNode {
    return item as ReportNode;
  }

  protected currentOperations(item: AggregatedReportView): Operation[] {
    return item.currentOperations ?? [];
  }

  protected openIterationDetails(item: ReportNode): void {
    this._executionDialogs.openIterationDetails(item);
  }

  protected iterationErrorMessage(item: ReportNode): string | undefined {
    return item.error?.msg?.trim() || undefined;
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
  protected readonly TestCasesDisplayMode = TestCasesDisplayMode;
}
