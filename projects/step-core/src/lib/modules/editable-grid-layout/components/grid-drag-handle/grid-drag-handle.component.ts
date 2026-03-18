import { Component } from '@angular/core';
import { GridDragHandleDirective } from '../../directives/grid-drag-handle.directive';
import { GridElementRemoveComponent } from '../grid-element-remove/grid-element-remove.component';
import { GridElementTitleComponent } from '../grid-element-title/grid-element-title.component';

@Component({
  selector: 'step-grid-drag-handle',
  imports: [GridElementRemoveComponent, GridElementTitleComponent],
  templateUrl: './grid-drag-handle.component.html',
  styleUrl: './grid-drag-handle.component.scss',
  hostDirectives: [GridDragHandleDirective],
})
export class GridDragHandleComponent {}
