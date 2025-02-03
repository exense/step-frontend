import { Directive, input, effect, inject } from '@angular/core';
import { GridsterItemComponent } from 'angular-gridster2';

export interface GridsterItemConfig {
  cols: number;
  rows: number;
  x: number;
  y: number;
}

@Directive({
  standalone: true,
  selector: 'gridster-item[itemM]',
})
export class GridsterItemResponsiveDirective {
  readonly itemS = input<GridsterItemConfig | undefined>(); // Small
  readonly itemM = input<GridsterItemConfig | undefined>(); // Medium
  readonly itemL = input<GridsterItemConfig | undefined>(); // Large

  private _item = inject(GridsterItemComponent);

  constructor() {
    this._item.item = { x: -1, y: -1, cols: -1, rows: -1 };
  }

  private inputsEffect = effect(() => {
    const itemS = this.itemS();
    const itemM = this.itemM();
    const itemL = this.itemL();

    // TODO decide best input based of availability and resolution
    const selectedConfig = itemM!;
    this._item.item = {
      x: selectedConfig.x,
      y: selectedConfig.y,
      cols: selectedConfig.cols,
      rows: selectedConfig.rows,
    };
    this._item.updateOptions();
  });
}
