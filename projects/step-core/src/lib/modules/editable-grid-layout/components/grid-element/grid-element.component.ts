import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';

@Component({
  selector: 'step-grid-element',
  imports: [],
  templateUrl: './grid-element.component.html',
  styleUrl: './grid-element.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'step-grid-element',
    '[class.element-hidden]': 'isHidden()',
    '[attr.data-grid-element-id]': 'elementId()',
    '[style.grid-column]': 'gridColumn()',
    '[style.grid-row]': 'gridRow()',
  },
})
export class GridElementComponent {
  private _positionsState = inject(WidgetsPositionsStateService);

  private readonly isRenderComplete = signal(false);

  readonly _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly elementId = input.required<string>();

  private readonly position = computed(() => {
    const elementId = this.elementId();
    const positions = this._positionsState.positions();
    return positions[elementId];
  });

  readonly widgetType = computed(() => {
    const position = this.position();
    return position.widgetType;
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
