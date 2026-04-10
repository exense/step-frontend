import { AfterViewInit, Component, inject, untracked, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AggregatedReportView,
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
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { Status } from '../../../_common/shared/status.enum';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { AGGREGATED_TREE_WIDGET_STATE } from '../../services/aggregated-report-view-tree-state.service';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltReportNodeListSearchDirective } from '../../directives/alt-report-node-list-search.directive';
import { AltReportNodeListItemsPerPageDirective } from '../../directives/alt-report-node-list-items-per-page.directive';

@Component({
  selector: 'step-alt-report-node-testcases-widget',
  templateUrl: './alt-report-node-testcases-widget.component.html',
  styleUrl: './alt-report-node-testcases-widget.component.scss',
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
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('testCases', STORE_ALL),
  ],
  hostDirectives: [AltReportNodeListSearchDirective, AltReportNodeListItemsPerPageDirective],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeTestcasesWidgetComponent implements AfterViewInit {
  protected readonly _state = inject(AltReportNodesStateService);
  private _executionDialogs = inject(AltExecutionDialogsService);
  private _treeState = inject(AGGREGATED_TREE_WIDGET_STATE);
  private _listSearch = inject(AltReportNodeListSearchDirective, { self: true });
  protected readonly _mode = inject(VIEW_MODE);

  protected readonly tableSearch = viewChild('table', { read: TableSearch });

  private get tableSearchUntracked(): TableSearch | undefined {
    return untracked(() => this.tableSearch());
  }

  ngAfterViewInit(): void {
    this._listSearch.searchName$.subscribe((name) => this.tableSearchUntracked?.onSearch?.('name', name));
    this._listSearch.searchStatuses$.subscribe((status) => this.tableSearchUntracked?.onSearch?.('status', status));
    this._listSearch.searchReportNodeClass$.subscribe((reportNodeClass) =>
      this.tableSearchUntracked?.onSearch?.('_class', reportNodeClass),
    );
  }

  onSearchFor(item: AggregatedReportView, message: string): void {
    this.showIterations(item, { searchFor: message });
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
