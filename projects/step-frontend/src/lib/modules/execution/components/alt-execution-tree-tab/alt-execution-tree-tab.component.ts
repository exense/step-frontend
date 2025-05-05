import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AGGREGATED_TREE_TAB_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { TreeStateService } from '@exense/step-core';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { TREE_SEARCH_DESCRIPTION } from '../../services/tree-search-description.token';

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
  protected readonly _treeSearchDescription = inject(TREE_SEARCH_DESCRIPTION);

  private _treeState = inject(AGGREGATED_TREE_TAB_STATE);
  protected readonly searchCtrl = this._treeState.searchCtrl;

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  protected readonly foundItems = computed(() => this._treeState.searchResult().length);
  protected readonly pageIndex = signal(0);

  private effectFocusNode = effect(() => {
    const foundItems = this.foundItems();
    const pageIndex = this.pageIndex();
    if (!foundItems) {
      return;
    }
    untracked(() => {
      const itemId = this._treeState.pickSearchResultItemByIndex(pageIndex);
      if (itemId) {
        this.tree()?.focusNode(itemId);
      }
    });
  });

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
          const nodeId = this._treeState.getNodeIdsByArtefactId(data.artefactId)[0];
          if (!nodeId) {
            return of(undefined);
          }
          return this._treeState.expandNode(nodeId).pipe(map((isExpanded) => (isExpanded ? data : undefined)));
        }),
        filter((data) => !!data),
      )
      .subscribe((data) => {
        const nodeId = this._treeState.getNodeIdsByArtefactId(data.artefactId)[0]!;
        const node = this._treeState.findNodeById(nodeId);
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
