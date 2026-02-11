import { afterNextRender, computed, Directive, ElementRef, inject, input, signal } from '@angular/core';
import { WidgetsPositionsStateService } from '../injectables/widgets-positions-state.service';

@Directive({
  selector: '[stepGridElement]',
  host: {
    class: 'step-grid-element',
    '[class.element-hidden]': 'isHidden()',
    '[attr.data-grid-element-id]': 'elementId()',
    '[style.grid-column]': 'gridColumn()',
    '[style.grid-row]': 'gridRow()',
  },
})
export class GridElementDirective {
  private _positionsState = inject(WidgetsPositionsStateService);

  private readonly isRenderComplete = signal(false);

  readonly _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly elementId = input.required<string>({ alias: 'stepGridElement' });

  private readonly position = computed(() => {
    const elementId = this.elementId();
    const positions = this._positionsState.positions();
    return positions[elementId];
  });

  protected readonly isHidden = computed(() => {
    const position = this.position();
    return !position;
  });

  protected readonly gridColumn = computed(() => {
    const position = this.position();
    if (!position) {
      return undefined;
    }
    const { column, widthInCells } = position;
    if (widthInCells === 1) {
      return column.toString();
    }
    return `${column} / ${column + widthInCells}`;
  });

  protected readonly gridRow = computed(() => {
    const position = this.position();
    if (!position) {
      return undefined;
    }
    const { row, heightInCells } = position;
    if (heightInCells === 1) {
      return row.toString();
    }
    return `${row} / ${row + heightInCells}`;
  });

  constructor() {
    afterNextRender(() => this.isRenderComplete.set(true));
  }
}
