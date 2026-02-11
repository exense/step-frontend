import { Component } from '@angular/core';
import { GridDragHandleDirective } from '../../directives/grid-drag-handle.directive';
import {GridElementRemoveComponent} from '../grid-element-remove/grid-element-remove.component';

@Component({
  selector: 'step-grid-drag-handle',
  imports: [
    GridElementRemoveComponent
  ],
  templateUrl: './grid-drag-handle.component.html',
  styleUrl: './grid-drag-handle.component.scss',
  hostDirectives: [GridDragHandleDirective],
})
export class GridDragHandleComponent {}
