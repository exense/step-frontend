import { BaseRegistryService } from './base-registry.service';
import { Injectable, Type } from '@angular/core';
import { CustomComponent } from '../shared/custom-component';
import { CustomRegistryItem } from '../shared/custom-registry-item';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';

export interface ExecutionCustomPanelMetadata {
  cssClassName?: string;
  colSpan?: number;
}

export interface ExecutionCustomPanelRegistryItem extends CustomRegistryItem {
  metadata?: ExecutionCustomPanelMetadata;
}

export type ExecutionCustomPanelItemInfo = Pick<ExecutionCustomPanelRegistryItem, 'type' | 'label' | 'metadata'>;

@Injectable({
  providedIn: 'root',
})
export class ExecutionCustomPanelRegistryService extends BaseRegistryService {
  protected override readonly registryType = CustomRegistryType.EXECUTION_CUSTOM_PANEL;

  override register(
    type: string,
    label: string,
    component?: Type<CustomComponent>,
    metadata?: ExecutionCustomPanelMetadata,
  ): void {
    const item: ExecutionCustomPanelRegistryItem = { type, label, component, metadata };
    this._customRegistry.register(this.registryType, type, item);
  }

  override getItemInfos(): ReadonlyArray<ExecutionCustomPanelItemInfo> {
    const items = this._customRegistry.getRegisteredItems(this.registryType) as ExecutionCustomPanelItemInfo[];
    return items.map((item) => {
      const { type, label, metadata } = item;
      return { type, label, metadata };
    });
  }
}
