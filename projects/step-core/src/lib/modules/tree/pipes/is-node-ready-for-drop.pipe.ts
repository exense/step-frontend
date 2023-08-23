import { inject, Pipe, PipeTransform } from '@angular/core';
import { TreeDragDropService } from '../services/tree-drag-drop.service';
import { map, Observable } from 'rxjs';

@Pipe({
  name: 'isNodeReadyForDrop',
})
export class IsNodeReadyForDropPipe implements PipeTransform {
  private _dragDrop = inject(TreeDragDropService);

  transform(nodeId: string): Observable<boolean> {
    return this._dragDrop.dropNodeId$.pipe(map((dropNodeId) => dropNodeId === nodeId));
  }
}
