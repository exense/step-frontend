import { Component, inject, output, viewChild } from '@angular/core';
import {
  AggregatedReportView,
  ItemsPerPageService,
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
  standalone: false,
})
export class AltReportNodesTestcasesComponent extends BaseAltReportNodeTableContentComponent {
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _treeState = inject(AGGREGATED_TREE_WIDGET_STATE);

  protected tableSearch = viewChild('table', { read: TableSearch });
  showAllOperations = false;

  readonly openTestCaseInTreeView = output<ReportNode>();

  onSearchFor(item: AggregatedReportView, message: string): void {
    this.showIterations(item, { searchFor: message });
  }

  override setupDateRangeFilter(): void {
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

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
