import { Component, computed, inject } from '@angular/core';
import { GRID_LAYOUT_CONFIG } from '../../injectables/grid-layout-config.token';
import { GridElementDirective } from '../../directives/grid-element.directive';

@Component({
  selector: 'step-grid-element-title',
  imports: [],
  templateUrl: './grid-element-title.component.html',
  styleUrl: './grid-element-title.component.scss',
})
export class GridElementTitleComponent {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridElement = inject(GridElementDirective);

  protected readonly displayTitle = computed(() => {
    const id = this._gridElement.elementId();
    const title = this._gridConfig.defaultElementParamsMap[id]?.title;
    return title ?? id;
  });
}
