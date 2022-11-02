import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { combineLatest, debounceTime, first, map, merge, of, startWith, Subject, takeUntil } from 'rxjs';
import { Mutable } from '../../../../shared';
import { ArtefactTypesService } from '../../../basics/step-basics.module';
import { DOCUMENT } from '@angular/common';

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
    private _artefactTypes: ArtefactTypesService,
    private _treeState: TreeStateService,
    private _drag: CdkDrag,
    private _dropList: CdkDropList
  ) {}

  ngOnInit(): void {
    this.setupCursor();
    this.setupLabelAndIcon();
  }

  ngOnDestroy(): void {
    this.terminator$.next({});
    this.terminator$.complete();
    this._document.body.style.cursor = '';
  }

  private setupCursor(): void {
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

    combineLatest([distance$, indexes$])
      .pipe(
        map(([distance, indexes]) => ({ distance, ...indexes })),
        map((position) => this._treeState.canInsertSelectedNodesAt(position)),
        takeUntil(this.terminator$)
      )
      .subscribe((canInsert) => {
        this._document.body.style.cursor = canInsert ? CURSOR_GRABBING : CURSOR_NOT_ALLOWED;
      });
  }

  private setupLabelAndIcon(): void {
    const labelAndIcon$ = this._treeState.selectedNodes$.pipe(
      map((nodes) => {
        let label = '';
        let icon = '';

        if (nodes.length === 1) {
          label = nodes[0].name;
          icon = this._artefactTypes.getIconNg2(nodes[0]._class);
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
