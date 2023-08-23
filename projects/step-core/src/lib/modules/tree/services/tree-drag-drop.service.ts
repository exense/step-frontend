import { inject, Injectable, OnDestroy } from '@angular/core';
import { CdkDrag, CdkDragEnter, CdkDragExit, CdkDragStart } from '@angular/cdk/drag-drop';
import { BehaviorSubject, combineLatest, debounceTime, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { DropInfo } from '../shared/drop-info';
import { TreeStateService } from './tree-state.service';
import { DropType } from '../shared/drop-type.enum';
import { LastNodeContainerService } from './last-node-container.service';

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
  private _treeState = inject<TreeStateService<any, any>>(TreeStateService);
  private _lastNodeIdContainer = inject(LastNodeContainerService);

  private terminate$?: Subject<void>;

  private dragItem$: Observable<DragItem | undefined> = of(undefined);
  private dropItem$ = new BehaviorSubject<DropItem | undefined>(undefined);

  private dropInfo$: Observable<DropInfo | undefined> = of(undefined);

  private lastDropInfo?: DropInfo;

  private dropNodeIdInternal$ = new BehaviorSubject<string | undefined>(undefined);
  readonly dropNodeId$ = this.dropNodeIdInternal$.asObservable();

  onDragStart(event: CdkDragStart<any>): Observable<DropInfo | undefined> {
    this.terminate();
    this.setupStreams(event.source);
    return this.dropInfo$;
  }

  onDragEnd(): void {
    this.terminate();
  }

  onEnter(event: CdkDragEnter<string>): void {
    const nodeId = event.container.data;
    const rect = event.container.element.nativeElement.getBoundingClientRect();
    const { x, y, width, height } = rect;
    this.dropItem$.next({ nodeId, x, y, width, height });
  }

  onExit(event: CdkDragExit<any>): void {
    this.dropItem$.next(undefined);
  }

  handleDrop(): void {
    if (!this.lastDropInfo || !this.lastDropInfo.canInsert) {
      return;
    }

    const { parentNodeId, siblingNodeId, dropType } = this.lastDropInfo;
    this._treeState.insertSelectedNodesTo(parentNodeId, dropType, siblingNodeId);
    if (dropType === DropType.inside) {
      setTimeout(() => {
        this._treeState.expandNode(parentNodeId).subscribe();
      }, 100);
    }
    this.terminate();
  }

  private setupStreams(drag: CdkDrag<any>): void {
    this.terminate$ = new Subject<void>();

    this.dragItem$ = drag.moved.pipe(
      debounceTime(10),
      map((evt) => {
        const { x, y } = evt.pointerPosition;
        const nodeId = drag.data;
        return { nodeId, x, y };
      }),
      takeUntil(this.terminate$)
    );

    this.dropInfo$ = combineLatest([this.dragItem$, this.dropItem$]).pipe(
      map(([drag, drop]) => {
        if (!drag) {
          return undefined;
        }
        const { y: dragY, nodeId: dragNodeId } = drag;
        const node = this._treeState.findNodeById(dragNodeId);
        if (!drop) {
          const dropNodeId = node.parentId;
          const dropType = DropType.inside;
          return { dragNodeId, dropType, canInsert: false, parentNodeId: dropNodeId, siblingNodeId: node.id };
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
        }

        if (dropType === DropType.after && dropNodeId === this._lastNodeIdContainer.lastNode?.id) {
          dropType = DropType.inside;
        }

        const potentialDropInfo = this._treeState.determineInsertionNode(dropNodeId, dropType);
        if (!potentialDropInfo) {
          return {
            dragNodeId,
            dropType,
            canInsert: false,
            parentNodeId: dropNodeId,
            siblingNodeId: dropNodeId,
          };
        }

        const canInsert = this._treeState.canInsertTo(potentialDropInfo.parentId);

        return {
          dragNodeId,
          canInsert,
          dropType: potentialDropInfo.dropType,
          parentNodeId: potentialDropInfo.parentId,
          siblingNodeId: potentialDropInfo.siblingId,
        };
      })
    );

    this.dropInfo$.pipe(takeUntil(this.terminate$)).subscribe((dropInfo) => {
      this.lastDropInfo = dropInfo;
      this.dropNodeIdInternal$.next(dropInfo?.parentNodeId);
    });
  }

  private terminate(): void {
    if (!this.terminate$) {
      return;
    }
    this.terminate$.next();
    this.terminate$.complete();
    this.terminate$ = undefined;
    this.dropInfo$ = of(undefined);
    this.dropNodeIdInternal$.next(undefined);
  }

  ngOnDestroy() {
    this.terminate();
    this.dropItem$.complete();
    this.dropNodeIdInternal$.complete();
  }
}
