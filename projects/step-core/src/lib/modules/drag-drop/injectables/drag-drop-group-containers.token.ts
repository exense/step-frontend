import { InjectionToken } from '@angular/core';
import { DragDropGroupContainerService } from './drag-drop-group-container.service';

export const DRAG_DROP_GROUP_CONTAINERS = new InjectionToken<DragDropGroupContainerService[]>(
  'Drag drop group containers',
);
