import { Directive } from '@angular/core';
import { DragDropGroupContainerService } from '../injectables/drag-drop-group-container.service';
import { DRAG_DROP_GROUP_CONTAINERS } from '../injectables/drag-drop-group-containers.token';

@Directive({
  selector: '[stepDragDropGroupContainer]',
  standalone: true,
  providers: [
    DragDropGroupContainerService,
    {
      provide: DRAG_DROP_GROUP_CONTAINERS,
      useExisting: DragDropGroupContainerService,
      multi: true,
    },
  ],
})
export class DragDropGroupContainerDirective {}
