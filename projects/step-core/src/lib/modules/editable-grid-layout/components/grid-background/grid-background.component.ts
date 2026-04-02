import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';
import { GRID_COLUMN_COUNT } from '../../injectables/grid-column-count.token';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { GridAddWidgetComponent } from '../grid-add-widget/grid-add-widget.component';

interface Row {
  index: number;
  isEmpty: boolean;
}

interface Cell {
  index: number;
  hasAddButton: boolean;
}

@Component({
  selector: 'step-grid-background',
  imports: [StepBasicsModule, GridAddWidgetComponent],
  templateUrl: './grid-background.component.html',
  styleUrl: './grid-background.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[style.--style__cols-count]': '_colCount',
    '[style.--style__rows-count]': 'rowsCount()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridBackgroundComponent {
  protected readonly _colCount = inject(GRID_COLUMN_COUNT) + 1;
  private _widgetPositionState = inject(WidgetsPositionsStateService);

  protected readonly rowsCount = computed(() => this._widgetPositionState.fieldBottom() + 1);

  protected readonly cells = computed(() => {
    const widgetsBottom = this._widgetPositionState.widgetsBottom();
    const colCount = this._colCount - 1;
    const size = this.rowsCount() * colCount;
    // First cell in the last row
    const addCellIndex = widgetsBottom * colCount;
    return this.createArray(size, (index) => ({ index, hasAddButton: index === addCellIndex }) as Cell);
  });

  protected readonly addCellCoordinates = computed(() => {
    const widgetsBottom = this._widgetPositionState.widgetsBottom();
    if (widgetsBottom < 0) {
      return undefined;
    }
    const rowStart = widgetsBottom + 1;
    const rowEnd = rowStart + 1;
    const colStart = 1;
    const colEnd = colStart + 1;
    return `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`;
  });

  protected readonly verticalCols = computed(() => {
    const size = this._colCount;
    return this.createArray(size);
  });

  protected readonly horizontalRows = computed(() => {
    const positions = this._widgetPositionState.positions();
    const size = this.rowsCount();
    return this.createArray<Row>(size, (index) => ({
      index,
      isEmpty: index < size - 1 ? this._widgetPositionState.isEmptyRow(index + 1) : false,
    }));
  });

  protected insertAfterRow(rowIndex: number): void {
    this._widgetPositionState.insertAfterRow(rowIndex);
  }

  protected removeRow(rowIndex: number): void {
    this._widgetPositionState.removeRow(rowIndex + 1);
  }

  private createArray<T = number>(size: number, itemFactory: (index: number) => T = (index) => index as T): T[] {
    const result = new Array(size);
    for (let i = 0; i < size; i++) {
      result[i] = itemFactory(i);
    }
    return result;
  }
}
