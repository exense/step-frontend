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
  TreeStateService,
} from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { TableMemoryStorageService } from '../../services/table-memory-storage.service';
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
})
export class AltReportNodesTestcasesComponent extends BaseAltReportNodeTableContentComponent {
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _treeState = inject(AGGREGATED_TREE_WIDGET_STATE);

  protected tableSearch = viewChild('table', { read: TableSearch });
  showAllOperations = false;

  readonly openTestCaseInTreeView = output<ReportNode>();

  override setupDateRangeFilter(): void {
    // Empty implementation
  }

  protected showIterations(item: AggregatedReportView, status?: Status, count?: number, event?: MouseEvent): void {
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const artefactId = item.artefact!.id!;

    const node = this._treeState
      .findNodesByArtefactId(artefactId)
      .find((node) => node.artefactHash === item.artefactHash);

    if (!node) {
      return;
    }

    if (!count) {
      count = Object.values(item.countByStatus ?? {}).reduce((res, item) => res + item, 0);
    }

    this._executionDialogs.openIterations({
      aggregatedNodeId: node.id,
      artefactHash: item.artefactHash!,
      countByStatus: item.countByStatus,
      nodeStatus: status,
      nodeStatusCount: count,
    });
  }
}
