import { AfterViewInit, Component, inject, signal, untracked, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedScreenService,
  FilterConditionFactoryService,
  ItemsPerPageService,
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
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { map, Observable, of } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { VIEW_MODE } from '../../shared/view-mode';
import { AltReportNodeListSearchDirective } from '../../directives/alt-report-node-list-search.directive';
import { AltReportNodeListItemsPerPageDirective } from '../../directives/alt-report-node-list-items-per-page.directive';

@Component({
  selector: 'step-alt-report-node-keywords-widget',
  templateUrl: './alt-report-node-keywords-widget.component.html',
  styleUrl: './alt-report-node-keywords-widget.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
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
    tablePersistenceConfigProvider('keywords', { ...STORE_ALL, storeSort: false }),
  ],
  hostDirectives: [AltReportNodeListSearchDirective, AltReportNodeListItemsPerPageDirective],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AltReportNodeKeywordsWidgetComponent implements AfterViewInit {
  readonly _state = inject(AltReportNodesStateService);
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  private _screenApiService = inject(AugmentedScreenService);
  private _listSearch = inject(AltReportNodeListSearchDirective, { self: true });
  protected readonly _mode = inject(VIEW_MODE);

  private _executionState = inject(AltExecutionStateService);
  private _dialogs = inject(AltExecutionDialogsService);

  protected readonly tableSearch = viewChild('table', { read: TableSearch });

  private get tableSearchUntracked(): TableSearch | undefined {
    return untracked(() => this.tableSearch());
  }

  protected readonly keywordsParameters$ = this._executionState.keywordParameters$;
  protected readonly calculateCounts = signal(false);

  private readonly keywordColumnIds = toSignal(this.getKeywordColumnIds(), { initialValue: [] });

  protected openDetails(node: ReportNode): void {
    this._dialogs.openIterationDetails(node);
  }

  private searchName$ = this._state.search$.pipe(
    map((value) => this._filterConditionFactory.reportNodeFilterCondition(value, this.keywordColumnIds())),
    takeUntilDestroyed(),
  );

  ngAfterViewInit(): void {
    this.searchName$.subscribe((name) => this.tableSearchUntracked?.onSearch?.('name', name));
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

  protected toggleCountsCalculation(): void {
    this.calculateCounts.update((value) => !value);
  }

  private getKeywordColumnIds(): Observable<string[]> {
    return this._screenApiService.getInputsForScreenPost('keyword').pipe(
      map((inputs) => inputs.map((input) => input?.id || '').filter((id) => !!id)),
      catchError((err) => {
        console.error(err);
        return of([]);
      }),
    );
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
