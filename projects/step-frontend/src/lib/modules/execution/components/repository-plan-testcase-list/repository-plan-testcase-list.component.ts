import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  ControllerService,
  Mutable,
  TestRunStatus,
  SelectionCollector,
  TableLocalDataSource,
  RepositoryObjectReference,
} from '@exense/step-core';
import { BehaviorSubject, map, of, shareReplay, switchMap, tap, Subject, takeUntil, combineLatest, first } from 'rxjs';
import { Status } from '../../../_common/step-common.module';

type InProgress = Mutable<Pick<RepositoryPlanTestcaseListComponent, 'inProgress'>>;
type FlagsAccessor = Mutable<
  Pick<RepositoryPlanTestcaseListComponent, 'isIntermediateSelected$' | 'isSomeItemsSelected$'>
>;

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Component({
  selector: 'step-repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
})
export class RepositoryPlanTestcaseListComponent implements OnInit, OnChanges, OnDestroy {
  private terminator$: Subject<unknown> = new Subject<unknown>();
  private cRepoRef$ = new BehaviorSubject<RepositoryObjectReference | undefined>(undefined);

  private repositoryReport$ = this.cRepoRef$.pipe(
    tap(() => ((this as InProgress).inProgress = true)),
    switchMap((repoRef) => {
      if (!repoRef) {
        return of(undefined);
      }

      if (!repoRef?.repositoryParameters?.['planid']) {
        return this._controllerService.getReport(repoRef).pipe(
          map((value) => {
            if (value?.runs?.length! > 0) {
              value.runs!.forEach((run) => {
                if (!run.id) {
                  run.id = run.testplanName;
                }
              });
            }
            return value;
          })
        );
      }
      return this._controllerService.getReport({
        repositoryID: 'local',
        repositoryParameters: { planid: repoRef?.repositoryParameters?.['planid'] },
      });
    }),
    map((testSetStatusOverview) => testSetStatusOverview?.runs || []),
    tap(() => ((this as InProgress).inProgress = false)),
    tap(() => this._selectionCollector.clear()),
    shareReplay(1)
  );

  @Input() repoRef?: RepositoryObjectReference;

  readonly inProgress: boolean = false;

  readonly isIntermediateSelected$ = of(false);
  readonly isSomeItemsSelected$ = of(false);

  readonly statusItems$ = this.repositoryReport$.pipe(
    map((testRunStatusList) => testRunStatusList.map((testRunStatus) => testRunStatus.status as Status).filter(unique))
  );

  readonly searchableRepositoryReport$ = new TableLocalDataSource(this.repositoryReport$, {
    searchPredicates: {
      status: (element, searchValue) => {
        return searchValue.toLowerCase().includes(element!.status!.toLowerCase());
      },
    },
  });

  constructor(
    public readonly _controllerService: ControllerService,
    public readonly _selectionCollector: SelectionCollector<string, TestRunStatus>
  ) {}

  ngOnInit(): void {
    this.setupCollectorChanges(this._selectionCollector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cRepoRef = changes['repoRef'];
    if (cRepoRef?.previousValue !== cRepoRef?.currentValue || cRepoRef?.firstChange) {
      this.cRepoRef$.next(cRepoRef?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.cRepoRef$.complete();
    this.terminator$.next({});
    this.terminator$.complete();
  }

  loadTable(): void {
    this.cRepoRef$.next(this.cRepoRef$.value);
  }

  handleCheckboxChange(): void {
    if (this._selectionCollector.length > 0) {
      // If something was selected, clear selection
      this._selectionCollector.clear();
      return;
    }

    // Otherwise select all items, which are exists
    this.repositoryReport$.pipe(first()).subscribe((testRunStatuses) => {
      this._selectionCollector.select(...testRunStatuses);
    });
  }

  private setupCollectorChanges(collector: SelectionCollector<string, TestRunStatus>): void {
    const flagAccessor = this as FlagsAccessor;

    flagAccessor.isSomeItemsSelected$ = collector.length$.pipe(
      map((length) => length > 0),
      takeUntil(this.terminator$)
    );

    const itemsLength$ = this.repositoryReport$.pipe(map((items) => items.length));
    flagAccessor.isIntermediateSelected$ = combineLatest([collector.length$, itemsLength$]).pipe(
      map(([length, itemsLength]) => length > 0 && itemsLength > 0 && length !== itemsLength),
      takeUntil(this.terminator$)
    );

    // Select all items by default, when new selectionCollector is assigned
    this.repositoryReport$.pipe(first()).subscribe((items) => {
      collector.select(...items);
    });
  }
}
