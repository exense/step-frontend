import { Component } from '@angular/core';
import { GridDragHandleDirective } from '../../directives/grid-drag-handle.directive';

@Component({
  selector: 'step-grid-drag-handle',
  imports: [],
  templateUrl: './grid-drag-handle.component.html',
  styleUrl: './grid-drag-handle.component.scss',
  hostDirectives: [GridDragHandleDirective],
})
export class GridDragHandleComponent {}
