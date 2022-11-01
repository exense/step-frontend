import { Component, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  ControllerService,
  Mutable,
  TestRunStatus,
  SelectionCollector,
  SelectionCollectorContainer,
  TableLocalDataSource,
} from '@exense/step-core';
import { BehaviorSubject, map, of, shareReplay, switchMap, tap, Subject, takeUntil, combineLatest, first } from 'rxjs';
import { Status } from '../../../_common/step-common.module';

type InProgress = Mutable<Pick<RepositoryPlanTestcaseListComponent, 'inProgress'>>;
type FlagsAccessor = Mutable<
  Pick<RepositoryPlanTestcaseListComponent, 'isIntermediateSelected$' | 'isSomeItemsSelected$'>
>;

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Component({
  selector: 'repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [
    {
      provide: SelectionCollectorContainer,
      useExisting: forwardRef(() => RepositoryPlanTestcaseListComponent),
    },
    {
      provide: SelectionCollector,
      useFactory: (container: SelectionCollectorContainer<string, TestRunStatus>) => container.selectionCollector,
      deps: [SelectionCollectorContainer],
    },
  ],
})
export class RepositoryPlanTestcaseListComponent
  implements SelectionCollectorContainer<string, TestRunStatus>, OnChanges, OnDestroy
{
  private collectorTerminator$?: Subject<unknown>;
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
    tap(() => this.selectionCollector.clear()),
    shareReplay(1)
  );

  @Input() planId?: string;
  @Input() selectionCollector!: SelectionCollector<string, TestRunStatus>;

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

  constructor(public readonly _controllerService: ControllerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cPlanId = changes['planId'];
    if (cPlanId?.previousValue !== cPlanId?.currentValue || cPlanId?.firstChange) {
      this.planId$.next(cPlanId?.currentValue);
    }

    const cSelectionCollector = changes['selectionCollector'];
    if (cSelectionCollector?.previousValue !== cSelectionCollector?.currentValue || cSelectionCollector?.firstChange) {
      this.setupCollectorChanges(cSelectionCollector?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.planId$.complete();
    this.terminate();
  }

  loadTable(): void {
    this.planId$.next(this.planId$.value);
  }

  handleCheckboxChange($event: Event): void {
    $event.preventDefault();
    if (this.selectionCollector.length > 0) {
      // If something was selected, clear selection
      this.selectionCollector.clear();
      return;
    }

    // Otherwise select all items, which are exists
    this.repositoryReport$.pipe(first()).subscribe((testRunStatuses) => {
      this.selectionCollector.select(...testRunStatuses);
    });
  }

  private setupCollectorChanges(collector?: SelectionCollector<string, TestRunStatus>): void {
    this.terminate();
    const flagAccessor = this as FlagsAccessor;
    if (!collector) {
      flagAccessor.isIntermediateSelected$ = of(false);
      flagAccessor.isSomeItemsSelected$ = of(false);
      return;
    }

    this.collectorTerminator$ = new Subject<unknown>();

    flagAccessor.isSomeItemsSelected$ = collector.length$.pipe(
      map((length) => length > 0),
      takeUntil(this.collectorTerminator$)
    );

    const itemsLength$ = this.repositoryReport$.pipe(map((items) => items.length));
    flagAccessor.isIntermediateSelected$ = combineLatest([collector.length$, itemsLength$]).pipe(
      map(([length, itemsLength]) => length > 0 && itemsLength > 0 && length !== itemsLength),
      takeUntil(this.collectorTerminator$)
    );
  }

  private terminate(): void {
    if (!this.collectorTerminator$) {
      return;
    }
    this.collectorTerminator$.next({});
    this.collectorTerminator$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepRepositoryPlanTestcaseList', downgradeComponent({ component: RepositoryPlanTestcaseListComponent }));
