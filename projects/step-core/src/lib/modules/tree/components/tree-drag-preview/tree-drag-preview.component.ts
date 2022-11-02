import { Component, OnInit } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { combineLatest, debounceTime, first, map, merge, Observable, of, startWith } from 'rxjs';
import { InsertPositionData } from '../../shared/insert-position-data';
import { Mutable } from '../../../../shared';

type FieldAccessor = Mutable<Pick<TreeDragPreviewComponent, 'canInsert$' | 'label$'>>;

@Component({
  selector: 'step-tree-drag-preview',
  templateUrl: './tree-drag-preview.component.html',
  styleUrls: ['./tree-drag-preview.component.scss'],
})
export class TreeDragPreviewComponent implements OnInit {
  constructor(private _treeState: TreeStateService, private _drag: CdkDrag, private _dropList: CdkDropList) {}

  readonly canInsert$ = of(false);
  readonly label$ = of('');

  ngOnInit(): void {
    this.setupInsertFlag();
    this.setupLabel();
  }

  private setupInsertFlag(): void {
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

    const indexes$ = merge(
      initialIndex$,
      this._dropList.sorted.pipe(map(({ currentIndex, previousIndex }) => ({ currentIndex, previousIndex })))
    );

    const sortPosition$: Observable<InsertPositionData> = combineLatest([distance$, indexes$]).pipe(
      map(([distance, indexes]) => ({ distance, ...indexes }))
    );

    (this as FieldAccessor).canInsert$ = sortPosition$.pipe(
      map((position) => this._treeState.canInsertSelectedNodesAt(position))
    );
  }

  private setupLabel(): void {
    (this as FieldAccessor).label$ = this._treeState.selectedNodes$.pipe(
      map((nodes) => {
        if (nodes.length === 1) {
          return nodes[0].name;
        }
        if (nodes.length > 1) {
          return `(${nodes.length}) items`;
        }
        return '';
      })
    );
  }
}
