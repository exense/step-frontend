import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AGGREGATED_TREE_TAB_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { PaginatorComponent, TreeStateService } from '@exense/step-core';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'step-alt-execution-tree-tab',
  templateUrl: './alt-execution-tree-tab.component.html',
  styleUrl: './alt-execution-tree-tab.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: TreeStateService,
      useExisting: AGGREGATED_TREE_TAB_STATE,
    },
    {
      provide: AggregatedReportViewTreeStateService,
      useExisting: AGGREGATED_TREE_TAB_STATE,
    },
  ],
})
export class AltExecutionTreeTabComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _executionDialogs = inject(AltExecutionDialogsService);

  private _treeState = inject(AGGREGATED_TREE_TAB_STATE);
  protected readonly searchCtrl = this._treeState.searchCtrl;

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });
  private paginator = viewChild('paginator', { read: PaginatorComponent });

  protected readonly foundItems = computed(() => this._treeState.searchResult().length);
  protected readonly hasOccurrences = computed(() => this.foundItems() > 0);

  private effectSearchChange = effect(
    () => {
      const searchResult = this._treeState.searchResult();
      const paginator = untracked(() => this.paginator());
      paginator?.firstPage();
    },
    { allowSignalWrites: true },
  );

  protected handleSearchResultPage(page: PageEvent): void {
    const index = page.pageIndex;
    const itemId = this._treeState.pickSearchResultItemByIndex(index);
    if (itemId) {
      this.tree()?.focusNode(itemId);
    }
  }

  ngOnInit(): void {
    this._activatedRoute.queryParams
      .pipe(
        map((params) => {
          const artefactId = params['artefactId'];
          const reportNodeId = params['reportNodeId'];
          return { artefactId, reportNodeId };
        }),
        filter((data) => !!data.artefactId),
        takeUntilDestroyed(this._destroyRef),
        switchMap((data) => {
          return this._treeState.expandNode(data.artefactId).pipe(map((isExpanded) => (isExpanded ? data : undefined)));
        }),
        filter((data) => !!data),
      )
      .subscribe((data) => {
        const node = this._treeState.findNodeById(data!.artefactId);
        if (!node) {
          return;
        }
        this._treeState.selectNode(node);
        this._executionDialogs.openIterations(node, { reportNodeId: data!.reportNodeId });
      });
  }

  protected collapseAll(): void {
    this._treeState.collapseAll();
  }

  protected expandAll(): void {
    this._treeState.expandAll();
  }
}
