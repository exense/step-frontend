import { Injectable } from '@angular/core';
import { DragDropContainerService } from './drag-drop-container.service';

@Injectable()
export abstract class DragDropGroupService {
  abstract registerGroupItem(item: DragDropContainerService): void;
  abstract unregisterGroupItem(item: DragDropContainerService): void;
}
