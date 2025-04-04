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
} from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { TableMemoryStorageService } from '../../services/table-memory-storage.service';
import { Status } from '../../../_common/shared/status.enum';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';

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

  protected tableSearch = viewChild('table', { read: TableSearch });
  showAllOperations = false;

  readonly openTestCaseInTreeView = output<ReportNode>();
  readonly reportNodeClick = output<ReportNode>();

  override setupDateRangeFilter(): void {
    // Empty implementation
  }

  protected showIterations(item: AggregatedReportView, status?: Status, count?: number, event?: MouseEvent): void {
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    if (!count) {
      count = Object.values(item.countByStatus ?? {}).reduce((res, item) => res + item, 0);
    }
    this._executionDialogs.openIterations({
      artefactId: item.artefact!.id!,
      artefactHash: item.artefactHash!,
      countByStatus: item.countByStatus,
      nodeStatus: status,
      nodeStatusCount: count,
    });
  }
}
