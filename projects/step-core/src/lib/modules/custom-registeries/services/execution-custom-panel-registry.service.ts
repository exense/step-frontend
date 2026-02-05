import { BaseRegistryService } from './base-registry.service';
import { inject, Injectable, Type } from '@angular/core';
import { CustomComponent } from '../shared/custom-component';
import { CustomRegistryItem } from '../shared/custom-registry-item';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';
import { GridElementInfo, GridSettingsRegistryService } from './grid-settings-registry.service';
import { EXECUTION_REPORT_GRID } from '../../execution-common/types/execution-report-grid';

export interface ExecutionCustomPanelMetadata extends Omit<GridElementInfo, 'id' | 'title'> {
  cssClassName?: string;
}

export interface ExecutionCustomPanelRegistryItem extends CustomRegistryItem {
  metadata?: ExecutionCustomPanelMetadata;
}

export type ExecutionCustomPanelItemInfo = Pick<ExecutionCustomPanelRegistryItem, 'type' | 'label' | 'metadata'>;

@Injectable({
  providedIn: 'root',
})
export class ExecutionCustomPanelRegistryService extends BaseRegistryService {
  private _gridSettingsRegistry = inject(GridSettingsRegistryService);

  protected override readonly registryType = CustomRegistryType.EXECUTION_CUSTOM_PANEL;

  override register(
    type: string,
    label: string,
    component?: Type<CustomComponent>,
    metadata?: ExecutionCustomPanelMetadata,
  ): void {
    const item: ExecutionCustomPanelRegistryItem = { type, label, component, metadata };
    this._customRegistry.register(this.registryType, type, item);
    if (metadata) {
      const { weight, widthInCells, heightInCells } = metadata;
      this._gridSettingsRegistry.register(EXECUTION_REPORT_GRID, {
        id: type,
        title: label,
        weight,
        widthInCells,
        heightInCells,
      });
    }
  }

  override getItemInfos(): ReadonlyArray<ExecutionCustomPanelItemInfo> {
    const items = this._customRegistry.getRegisteredItems(this.registryType) as ExecutionCustomPanelItemInfo[];
    return items.map((item) => {
      const { type, label, metadata } = item;
      return { type, label, metadata };
    });
  }
}
