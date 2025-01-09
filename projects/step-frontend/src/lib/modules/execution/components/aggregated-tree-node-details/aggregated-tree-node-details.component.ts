import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { arrayToRegex, AugmentedExecutionsService, ReportNode, TableSearch } from '@exense/step-core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { MatSort, SortDirection } from '@angular/material/sort';
import { FormBuilder } from '@angular/forms';
import { debounceTime, map, startWith } from 'rxjs';
import { REPORT_NODE_STATUS, Status } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-aggregated-tree-node-details',
  templateUrl: './aggregated-tree-node-details.component.html',
  styleUrl: './aggregated-tree-node-details.component.scss',
})
export class AggregatedTreeNodeDetailsComponent implements AfterViewInit {
  private _fb = inject(FormBuilder).nonNullable;
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _executionState = inject(AltExecutionStateService);
  private _augmentedExecutionService = inject(AugmentedExecutionsService);
  private _treeState = inject(AggregatedReportViewTreeStateService);

  readonly statuses = REPORT_NODE_STATUS;

  protected tableSearch = viewChild('table', { read: TableSearch });

  private matSort = viewChild(MatSort);

  protected sort = signal<SortDirection>('desc');

  private effectSort = effect(() => {
    const sort = this.sort();
    const mastSort = this.matSort();
    mastSort?.sort({ id: 'executionTime', start: sort, disableClear: true });
  });

  /** @Input() **/
  readonly node = input.required<AggregatedTreeNode>();

  /** @Input() **/
  readonly initialStatus = input<Status | undefined>(undefined);

  private artefactHash = computed(() => this.node().artefactHash);

  protected readonly dataSource = computed(() => {
    const artefactHash = this.artefactHash();
    return this._augmentedExecutionService.getReportNodeDataSource(artefactHash);
  });

  protected readonly keywordParameters = toSignal(
    this._executionState.keywordParameters$.pipe(
      // omit test case selection in case of tree
      map((keywordParameters) => ({ ...keywordParameters, testcases: undefined })),
    ),
  );

  protected readonly visibleDetails = this._treeState.visibleDetails;

  protected readonly searchCtrl = this._fb.control('');
  private searchSubscription = this.searchCtrl.valueChanges
    .pipe(
      startWith(this.searchCtrl.value),
      debounceTime(200),
      map((value) => (value ?? '').trim().toLowerCase()),
      takeUntilDestroyed(),
    )
    .subscribe((search) => this.tableSearch()?.onSearch('name', search));

  protected readonly statusesCtrl = this._fb.control<Status[]>([]);

  private effectSyncStatus = effect(
    () => {
      const initialStatus = this.initialStatus();
      this.statusesCtrl.setValue(initialStatus ? [initialStatus] : []);
    },
    { allowSignalWrites: true },
  );

  private statusCtrlValue = toSignal(this.statusesCtrl.valueChanges, {
    initialValue: this.statusesCtrl.value,
  });
  private statusesSubscription = this.statusesCtrl.valueChanges
    .pipe(
      startWith(this.statusesCtrl.value),
      map((statuses) => new Set(statuses)),
      map((statuses) => arrayToRegex(Array.from(statuses) as string[])),
      takeUntilDestroyed(),
    )
    .subscribe((statuses) => this.tableSearch()?.onSearch('status', { value: statuses, regex: true }));

  ngAfterViewInit(): void {
    const treeNodeName = this._el.nativeElement.closest<HTMLElement>('step-tree-node-name');
    if (treeNodeName) {
      this._renderer.addClass(treeNodeName, 'not-selectable');
    }
  }

  protected toggleDetail(node: ReportNode): void {
    this._treeState.toggleDetail(node);
  }

  protected toggleSort(): void {
    this.sort.update((sort) => (sort === 'asc' ? 'desc' : 'asc'));
  }

  readonly isFilteredByNonPassed = computed(() => {
    const statuses = new Set(this.statusCtrlValue());
    return statuses.size === this.statuses.length - 1 && !statuses.has(Status.PASSED);
  });

  protected toggleFilterNonPassed(): void {
    const isFilteredByNonPassed = this.isFilteredByNonPassed();
    const statuses = !isFilteredByNonPassed ? this.statuses.filter((status) => status !== Status.PASSED) : [];
    this.statusesCtrl.setValue(statuses);
  }
}
