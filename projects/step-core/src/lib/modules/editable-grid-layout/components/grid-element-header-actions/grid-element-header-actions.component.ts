import { Component, computed, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import {
  GRID_ELEMENT_HEADER_ACTIONS,
  GridElementHeaderAction,
} from '../../injectables/grid-element-header-actions.token';
import { GridElementComponent } from '../grid-element/grid-element.component';

@Component({
  selector: 'step-grid-element-header-actions',
  imports: [NgComponentOutlet],
  templateUrl: './grid-element-header-actions.component.html',
})
export class GridElementHeaderActionsComponent {
  private readonly _gridElement = inject(GridElementComponent);
  private readonly _actions = inject(GRID_ELEMENT_HEADER_ACTIONS, { optional: true }) ?? [];

  protected readonly actions = computed(() => {
    const widgetType = this._gridElement.widgetType();
    return this._actions.filter((action: GridElementHeaderAction) => {
      const supportedWidgetTypes = action.widgetTypes;
      return !supportedWidgetTypes?.length || supportedWidgetTypes.includes(widgetType);
    });
  });
}
