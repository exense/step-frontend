import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { GRID_LAYOUT_CONFIG } from '../../injectables/grid-layout-config.token';
import { WidgetsPositionsStateService } from '../../injectables/widgets-positions-state.service';
import { GridPoint } from '../../types/widget-position';

interface WidgetRecord {
  widgetType: string;
  title: string;
  canBeAdded: boolean;
}

@Component({
  selector: 'step-grid-add-widget',
  imports: [StepBasicsModule],
  templateUrl: './grid-add-widget.component.html',
  styleUrl: './grid-add-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridAddWidgetComponent {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _widgetPositionsState = inject(WidgetsPositionsStateService);

  readonly position = input<GridPoint>();

  protected readonly widgets = computed(() => {
    const positionsState = this._widgetPositionsState.positionsState();
    const usedTypes = new Set(Object.values(positionsState).map((position) => position.widgetType));
    return this._gridConfig.defaultElementParams.map((item) => {
      const { widgetType, title } = item;
      const canBeAdded = !item.denyDuplicates || !usedTypes.has(widgetType);
      return { widgetType, title, canBeAdded } as WidgetRecord;
    });
  });

  protected addWidget(widgetType: string): void {
    this._widgetPositionsState.add(widgetType, this.position());
  }
}
