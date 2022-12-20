import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ControllerService, Mutable, TestRunStatus, SelectionCollector, TableLocalDataSource } from '@exense/step-core';
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
  private planId$ = new BehaviorSubject<string | undefined>(undefined);

  private repositoryReport$ = this.planId$.pipe(
    tap(() => ((this as InProgress).inProgress = true)),
    switchMap((planId) => {
      if (!planId) {
        return of(undefined);
      }
      return this._controllerService.getReport({
        repositoryID: 'local',
        repositoryParameters: { planid: this.planId! },
      });
    }),
    map((testSetStatusOverview) => testSetStatusOverview?.runs || []),
    tap(() => ((this as InProgress).inProgress = false)),
    tap(() => this._selectionCollector.clear()),
    shareReplay(1)
  );

  @Input() planId?: string;

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
    const cPlanId = changes['planId'];
    if (cPlanId?.previousValue !== cPlanId?.currentValue || cPlanId?.firstChange) {
      this.planId$.next(cPlanId?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.planId$.complete();
    this.terminator$.next({});
    this.terminator$.complete();
  }

  loadTable(): void {
    this.planId$.next(this.planId$.value);
  }

  handleCheckboxChange($event: Event): void {
    $event.preventDefault();
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
