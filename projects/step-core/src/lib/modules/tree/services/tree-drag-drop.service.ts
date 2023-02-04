import { Injectable, OnDestroy } from '@angular/core';
import { CdkDrag, CdkDragEnter, CdkDragStart } from '@angular/cdk/drag-drop';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { DropInfo } from '../shared/drop-info';
import { TreeStateService } from './tree-state.service';
import { DropType } from '../shared/drop-type.enum';

interface DragItem {
  nodeId: string;
  x: number;
  y: number;
}

interface DropItem {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_NODE_HEIGHT = 40;

@Injectable()
export class TreeDragDropService implements OnDestroy {
  private terminate$?: Subject<any>;

  private dragItem$: Observable<DragItem | undefined> = of(undefined);
  private dropItem$ = new BehaviorSubject<DropItem | undefined>(undefined);

  private _dropInfo$: Observable<DropInfo | undefined> = of(undefined);

  private _lastDropInfo?: DropInfo;

  constructor(private _treeState: TreeStateService<any, any>) {}

  onDragStart(event: CdkDragStart<any>): Observable<DropInfo | undefined> {
    this.terminate();
    this.setupStreams(event.source);
    return this._dropInfo$;
  }

  onDragEnd(): void {
    this.terminate();
  }

  onEnter(event: CdkDragEnter<any>): void {
    const nodeId = event.container.data;
    const rect = event.container.element.nativeElement.getBoundingClientRect();
    const { x, y, width, height } = rect;
    this.dropItem$.next({ nodeId, x, y, width, height });
  }

  handleDrop(): void {
    if (!this._lastDropInfo || !this._lastDropInfo.canInsert) {
      return;
    }

    const { dropNodeId, dropType } = this._lastDropInfo;

    this._treeState.insertSelectedNodesTo(dropNodeId, dropType);
    if (dropType === DropType.inside) {
      setTimeout(() => {
        this._treeState.expandNode(dropNodeId).subscribe();
      }, 100);
    }
  }

  private setupStreams(drag: CdkDrag<any>): void {
    this.terminate$ = new Subject();

    this.dragItem$ = drag.moved.pipe(
      debounceTime(10),
      map((evt) => {
        const { x, y } = evt.pointerPosition;
        const nodeId = drag.data;
        return { nodeId, x, y };
      }),
      takeUntil(this.terminate$)
    );

    this._dropInfo$ = combineLatest([this.dragItem$, this.dropItem$]).pipe(
      map(([drag, drop]) => {
        if (!drag) {
          return undefined;
        }
        const { y: dragY, nodeId: dragNodeId } = drag;
        const node = this._treeState.findNodeById(dragNodeId);
        if (!drop) {
          const dropNodeId = node.parentId;
          const dropType = DropType.out;
          const height = DEFAULT_NODE_HEIGHT;
          const canInsert = this._treeState.canInsertTo(dropNodeId, true);
          return { dragNodeId, dropNodeId, height, dropType, canInsert };
        }
        let { nodeId: dropNodeId, height, y: dropY } = drop;

        const fourthPart = height / 4;
        const beforeEdge = dropY + fourthPart;
        const afterEdge = dropY + height - fourthPart;

        let dropType!: DropType;

        if (dragY >= dropY && dragY < beforeEdge) {
          dropType = DropType.before;
        } else if (dragY >= beforeEdge && dragY < afterEdge) {
          dropType = DropType.inside;
        } else if (dragY >= afterEdge) {
          dropType = DropType.after;
          if (dragY > dropY + height + fourthPart) {
            dropType = DropType.out;
            dropNodeId = node.parentId;
          }
        }

        const canInsert = this._treeState.canInsertTo(dropNodeId, dropType !== DropType.inside);
        return { dragNodeId, dropNodeId, height, dropType, canInsert };
      })
    );

    this._dropInfo$.pipe(takeUntil(this.terminate$)).subscribe((dropInfo) => (this._lastDropInfo = dropInfo));
  }

  private terminate(): void {
    if (!this.terminate$) {
      return;
    }
    this.terminate$.next({});
    this.terminate$.complete();
    this.terminate$ = undefined;
  }

  ngOnDestroy() {
    this.terminate();
    this.dropItem$.complete();
  }
}
