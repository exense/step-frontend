import {
  AfterViewInit,
  Component,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AugmentedScreenService,
  FilterConditionFactoryService,
  HighlightedItemExtractor,
  ReportNode,
  STORE_ALL,
  TableIndicatorMode,
  TableMemoryStorageService,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableSearch,
  TableStorageService,
} from '@exense/step-core';
import { AltReportNodeListSearchDirective } from '../../directives/alt-report-node-list-search.directive';
import { AltReportNodeListItemsPerPageDirective } from '../../directives/alt-report-node-list-items-per-page.directive';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'step-alt-report-node-keywords',
  templateUrl: './alt-report-node-keywords.component.html',
  styleUrl: './alt-report-node-keywords.component.scss',
  providers: [
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
export class AltReportNodeKeywordsComponent implements AfterViewInit {
  protected readonly TableIndicatorMode = TableIndicatorMode;
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _state = inject(AltReportNodesStateService);
  private _screenApiService = inject(AugmentedScreenService);
  private _listSearch = inject(AltReportNodeListSearchDirective, { self: true });

  private _executionState = inject(AltExecutionStateService);
  private _dialogs = inject(AltExecutionDialogsService);

  readonly selectedReportId = input<string | undefined>(undefined);
  readonly openDetails = output<ReportNode>();
  protected readonly tableSearch = viewChild('table', { read: TableSearch });

  private get tableSearchUntracked(): TableSearch | undefined {
    return untracked(() => this.tableSearch());
  }

  protected readonly extractReportId: HighlightedItemExtractor<ReportNode, string> = (node?: ReportNode) => node?.id;
  protected readonly keywordsParameters$ = this._executionState.keywordParameters$;
  protected readonly calculateCounts = signal(false);

  private readonly keywordColumnIds = toSignal(this.getKeywordColumnIds(), { initialValue: [] });

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

  private searchName$ = this._state.search$.pipe(
    map((value) => this._filterConditionFactory.reportNodeFilterCondition(value, this.keywordColumnIds())),
    takeUntilDestroyed(),
  );

  private getKeywordColumnIds(): Observable<string[]> {
    return this._screenApiService.getInputsForScreenPost('keyword').pipe(
      map((inputs) => inputs.map((input) => input?.id || '').filter((id) => !!id)),
      catchError((err) => {
        console.error(err);
        return of([]);
      }),
    );
  }
}
