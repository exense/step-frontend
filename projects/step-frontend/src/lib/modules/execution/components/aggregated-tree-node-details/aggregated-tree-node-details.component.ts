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
import { AugmentedExecutionsService, ReportNode } from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { MatSort, SortDirection } from '@angular/material/sort';

@Component({
  selector: 'step-aggregated-tree-node-details',
  templateUrl: './aggregated-tree-node-details.component.html',
  styleUrl: './aggregated-tree-node-details.component.scss',
})
export class AggregatedTreeNodeDetailsComponent implements AfterViewInit {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _executionState = inject(AltExecutionStateService);
  private _augmentedExecutionService = inject(AugmentedExecutionsService);
  private _treeState = inject(AggregatedReportViewTreeStateService);

  private matSort = viewChild(MatSort);

  protected sort = signal<SortDirection>('desc');

  private effectSort = effect(() => {
    const sort = this.sort();
    const mastSort = this.matSort();
    mastSort?.sort({ id: 'executionTime', start: sort, disableClear: true });
  });

  readonly node = input.required<AggregatedTreeNode>();

  private artefactHash = computed(() => this.node().artefactHash);

  protected readonly dataSource = computed(() => {
    const artefactHash = this.artefactHash();
    return this._augmentedExecutionService.getReportNodeDataSource(artefactHash);
  });

  protected readonly keywordParameters = toSignal(this._executionState.keywordParameters$);

  protected readonly visibleDetails = this._treeState.visibleDetails;

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
}
