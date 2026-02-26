import { Component, computed, inject } from '@angular/core';
import { GRID_LAYOUT_CONFIG } from '../../injectables/grid-layout-config.token';
import { GridElementComponent } from '../grid-element/grid-element.component';
import { GridItemDirective } from '../../directives/grid-item.directive';

@Component({
  selector: 'step-grid-element-title',
  imports: [],
  templateUrl: './grid-element-title.component.html',
  styleUrl: './grid-element-title.component.scss',
})
export class GridElementTitleComponent {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridElement = inject(GridElementComponent, { optional: true });
  private _gridItem = inject(GridItemDirective, { optional: true });

  protected readonly displayTitle = computed(() => {
    const elementWidgetType = this._gridElement?.widgetType?.();
    const itemWidgetType = this._gridItem?.widgetType?.();
    const widgetType = elementWidgetType ?? itemWidgetType;
    const title = !widgetType ? undefined : this._gridConfig.defaultElementParamsMap[widgetType]?.title;
    return title ?? widgetType;
  });
}
