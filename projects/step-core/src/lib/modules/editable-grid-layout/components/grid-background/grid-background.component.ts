import { ChangeDetectionStrategy, Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';
import { GRID_COLUMN_COUNT } from '../../injectables/grid-column-count.token';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-grid-background',
  imports: [StepBasicsModule],
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

  protected readonly verticalCols = computed(() => {
    const size = this._colCount;
    return this.createIndexArray(size);
  });

  protected readonly horizontalRows = computed(() => {
    const size = this.rowsCount();
    return this.createIndexArray(size);
  });

  protected insertAfterRow(row: number): void {
    this._widgetPositionState.insertAfterRow(row);
  }

  private createIndexArray(size: number): number[] {
    const result = new Array(size);
    for (let i = 0; i < size; i++) {
      result[i] = i;
    }
    return result;
  }
}
