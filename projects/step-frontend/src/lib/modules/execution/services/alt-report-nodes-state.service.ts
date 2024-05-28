import { inject, Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AltExecutionStateService } from './alt-execution-state.service';
import {
  map,
  startWith,
  combineLatest,
  debounceTime,
  shareReplay,
  take,
  Observable,
  iif,
  Subject,
  BehaviorSubject,
} from 'rxjs';
import { ReportNode } from '@exense/step-core';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

type ReportNodeStatus = ReportNode['status'];

@Injectable()
export abstract class AltReportNodesStateService implements OnDestroy {
  protected constructor(nodes$: Observable<ReportNode[] | undefined>) {
    nodes$.pipe(takeUntilDestroyed()).subscribe(this.nodes$);
  }

  private _activatedRoute = inject(ActivatedRoute);
  private _executionState = inject(AltExecutionStateService);
  private _fb = inject(FormBuilder);

  private get isIgnoreFilter(): boolean {
    return this._activatedRoute.snapshot.queryParamMap.has('viewAll');
  }

  private nodes$ = new BehaviorSubject<ReportNode[] | undefined>(undefined);

  private reportNodes$ = this.nodes$.pipe(
    map((nodes) => nodes ?? []),
    takeUntilDestroyed(),
  );

  readonly summary$ = this.reportNodes$.pipe(map((nodes) => this.createSummary(nodes)));

  readonly statuses$ = this.reportNodes$.pipe(
    map((nodes) => this.getAvailableStatuses(nodes)),
    shareReplay(1),
    takeUntilDestroyed(),
  );
  readonly showNonPassedFilterBtn$ = this.statuses$.pipe(
    map((statuses) => this.determineNonPassedFilterBtnVisibility(statuses)),
  );

  readonly statusesCtrl = this._fb.control<ReportNodeStatus[]>([]);

  private readonly selectedStatuses$ = this.statusesCtrl.valueChanges.pipe(
    startWith(this.statusesCtrl.value),
    map((statuses) => new Set(statuses)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly searchCtrl = this._fb.control<string>('');

  private readonly search$ = this.searchCtrl.valueChanges.pipe(
    startWith(this.searchCtrl.value),
    debounceTime(200),
    shareReplay(1),
    map((value) => (value ?? '').trim().toLowerCase()),
  );

  private readonly filteredNodes$ = combineLatest([
    this.reportNodes$,
    this.selectedStatuses$,
    this._executionState.timeRange$,
    this.search$,
  ]).pipe(
    map(([nodes, selectedStatuses, range, search]) => {
      let result = nodes;

      if (range?.from && range?.to) {
        result = result.filter(
          (node) => node.executionTime && node.executionTime >= range.from && node.executionTime <= range.to,
        );
      }

      if (selectedStatuses.size) {
        result = result.filter((node) => selectedStatuses.has(node.status));
      }

      if (search) {
        result = result.filter((node) => (node.name ?? '').toLowerCase().includes(search));
      }

      return result;
    }),
  );

  readonly nodesToDisplay$ = iif(() => this.isIgnoreFilter, this.reportNodes$, this.filteredNodes$);

  readonly total$ = this.nodesToDisplay$.pipe(map((nodes) => nodes?.length ?? 0));

  filterNonPassed(): void {
    this.statuses$
      .pipe(
        map((statuses) => statuses.filter((status) => status !== 'PASSED')),
        take(1),
      )
      .subscribe((statuses) => this.statusesCtrl.setValue(statuses));
  }

  private createSummary(reportNodes?: ReportNode[]): ReportNodeSummary | undefined {
    if (!reportNodes) {
      return undefined;
    }
    const summary = reportNodes.reduce(
      (res, keyword) => {
        if (keyword.status === 'PASSED') res.passed++;
        if (keyword.status === 'FAILED') res.failed++;
        if (keyword.status === 'TECHNICAL_ERROR') res.techError++;
        if (keyword.status === 'RUNNING') res.running++;
        return res;
      },
      { passed: 0, failed: 0, techError: 0, running: 0, total: 0 } as ReportNodeSummary,
    );
    summary.total = summary.passed + summary.failed + summary.techError + summary.running;
    return summary;
  }

  private getAvailableStatuses(reportNodes?: ReportNode[]): ReportNodeStatus[] {
    const statuses = (reportNodes ?? []).map((node) => node.status);
    return Array.from(new Set(statuses));
  }

  private determineNonPassedFilterBtnVisibility(statuses: ReportNodeStatus[]): boolean {
    return statuses.includes('PASSED') && statuses.length > 0;
  }

  ngOnDestroy(): void {
    this.nodes$.complete();
  }

  getStatusText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const statuses = this.statusesCtrl.value ?? [];
    if (!statuses.length) {
      return '';
    }
    return `Statuses: ${statuses.join(', ')}`;
  }

  getSearchText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const searchText = (this.searchCtrl.value ?? '').trim();
    if (!searchText) {
      return '';
    }
    return `Search: ${searchText}`;
  }
}
