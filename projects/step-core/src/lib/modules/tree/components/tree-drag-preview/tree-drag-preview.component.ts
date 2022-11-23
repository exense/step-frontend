import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { combineLatest, debounceTime, first, map, merge, of, startWith, Subject, takeUntil } from 'rxjs';
import { Mutable } from '../../../../shared';
import { DOCUMENT } from '@angular/common';
import { TreeNode } from '../../shared/tree-node';
import { InsertPotentialParentStateService } from '../../services/insert-potential-parent-state.service';

type FieldAccessor = Mutable<Pick<TreeDragPreviewComponent, 'label$' | 'icon$'>>;

const CURSOR_GRABBING = 'grabbing';
const CURSOR_NOT_ALLOWED = 'not-allowed';

@Component({
  selector: 'step-tree-drag-preview',
  templateUrl: './tree-drag-preview.component.html',
  styleUrls: ['./tree-drag-preview.component.scss'],
})
export class TreeDragPreviewComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<unknown>();

  readonly label$ = of('');
  readonly icon$ = of('');

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _treeState: TreeStateService<any, TreeNode>,
    private _drag: CdkDrag,
    private _dropList: CdkDropList,
    @Optional() private _insertPotentialParentState?: InsertPotentialParentStateService
  ) {}

  ngOnInit(): void {
    this.setupPotentialInsertLogic();
    this.setupLabelAndIcon();
  }

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
    this._document.body.style.cursor = '';
    if (this._insertPotentialParentState) {
      this._insertPotentialParentState.updatePotentialParentId(undefined);
    }
  }

  private setupPotentialInsertLogic(): void {
    const distance$ = this._drag.moved.pipe(
      debounceTime(100),
      map(({ distance }) => distance),
      startWith({ x: 0, y: 0 })
    );

    const initialIndex$ = this._drag.started.pipe(
      first(),
      map(() => {
        const index = this._treeState.getFirstSelectedNodeIndex();
        return {
          currentIndex: index,
          previousIndex: index,
        };
      })
    );

    const currentIndex$ = this._dropList.sorted.pipe(map((sorted) => sorted.currentIndex));

    const indexes$ = merge(
      initialIndex$,
      combineLatest([initialIndex$, currentIndex$]).pipe(
        map(([{ previousIndex }, currentIndex]) => ({ previousIndex, currentIndex }))
      )
    );

    combineLatest([distance$, indexes$])
      .pipe(
        map(([distance, indexes]) => ({ distance, ...indexes })),
        map((position) => this._treeState.getPotentialParentToInsertAtPosition(position)),
        takeUntil(this.terminator$)
      )
      .subscribe((potentialParentToInsert) => {
        const canInsert = !!potentialParentToInsert;
        this._document.body.style.cursor = canInsert ? CURSOR_GRABBING : CURSOR_NOT_ALLOWED;
        if (this._insertPotentialParentState) {
          this._insertPotentialParentState.updatePotentialParentId(potentialParentToInsert?.id);
        }
      });
  }

  private setupLabelAndIcon(): void {
    const labelAndIcon$ = this._treeState.selectedNodes$.pipe(
      map((nodes) => {
        let label = '';
        let icon = '';

        if (nodes.length === 1) {
          label = nodes[0].name;
          icon = nodes[0].icon;
        } else if (nodes.length > 1) {
          label = `(${nodes.length}) items`;
          icon = 'list';
        }

        return { label, icon };
      })
    );

    (this as FieldAccessor).label$ = labelAndIcon$.pipe(map((x) => x.label));
    (this as FieldAccessor).icon$ = labelAndIcon$.pipe(map((x) => x.icon));
  }
}
