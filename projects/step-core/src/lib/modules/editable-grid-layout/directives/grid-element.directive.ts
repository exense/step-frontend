import {
  afterNextRender,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { WidgetsPositionsStateService } from '../injectables/widgets-positions-state.service';
import { WidgetPosition } from '../types/widget-position';
import { GridDimensionsService } from '../injectables/grid-dimensions.service';
import { GRID_LAYOUT_CONFIG } from '../injectables/grid-layout-config.token';

@Directive({
  selector: '[stepGridElement]',
  host: {
    class: 'step-grid-element',
    '[attr.data-grid-element-id]': 'elementId()',
    '[style.grid-column]': 'gridColumn()',
    '[style.grid-row]': 'gridRow()',
  },
})
export class GridElementDirective {
  private _gridDimensions = inject(GridDimensionsService);
  private _positionsState = inject(WidgetsPositionsStateService);

  private readonly isRenderComplete = signal(false);

  readonly _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly elementId = input.required<string>({ alias: 'stepGridElement' });

  private readonly position = computed(() => {
    const elementId = this.elementId();
    const positions = this._positionsState.positions();
    return positions[elementId];
  });

  private effectInitializePosition = effect(() => {
    const position = this.position();
    const isRenderComplete = this.isRenderComplete();
    if (isRenderComplete && !position) {
      this.updatePositionIfRequired();
    }
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

  private updatePositionIfRequired(): void {
    const element = this._elRef.nativeElement;
    const id = untracked(() => this.elementId());
    if (!id) {
      return;
    }
    let position = this._positionsState.getPosition(id);
    if (!!position) {
      return;
    }
    const column = this._gridDimensions.determineCellColumn(element.offsetLeft + this._gridDimensions.columnGap);
    const row = this._gridDimensions.determineCellRow(element.offsetTop + this._gridDimensions.rowGap);
    const widthInCells = 1;
    const heightInCells = 1;

    position = new WidgetPosition(id, { column, row, widthInCells, heightInCells });
    this._positionsState.updatePosition(position);
  }
}
