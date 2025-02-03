import { Directive, AfterViewInit, input, Input, OnInit, effect, inject } from '@angular/core';
import { GridsterItemComponent } from 'angular-gridster2';

interface GridsterItemConfig {
  cols: number;
  rows: number;
  x: number;
  y: number;
}

@Directive({
  standalone: true,
  selector: '[itemM]',
})
export class GridsterItemResponsiveDirective {
  readonly itemS = input<GridsterItemConfig | undefined>(); // Small
  readonly itemM = input<GridsterItemConfig | undefined>(); // Medium
  readonly itemL = input<GridsterItemConfig | undefined>(); // Large

  item: GridsterItemComponent = inject(GridsterItemComponent);

  constructor() {
    this.item.item = { x: -1, y: -1, cols: -1, rows: -1 };
  }

  inputsEffect = effect(() => {
    const itemS = this.itemS();
    const itemM = this.itemM();
    const itemL = this.itemL();

    // TODO decide best input based of availability and resolution
    const selectedConfig = itemM!;
    this.item.item = {
      x: selectedConfig.x,
      y: selectedConfig.y,
      cols: selectedConfig.cols,
      rows: selectedConfig.rows,
    };
    this.item.updateOptions();
  });
}
