import { BaseItemComponent } from './base-item.component';
import { EntityItem } from '../../shared/entity-item';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component, Input, Type } from '@angular/core';
import { CustomRegistryService } from '../../services/custom-registry.service';

@Component({
  selector: 'step-entity-icon',
  templateUrl: './base-item.component.html',
  styleUrls: [],
})
export class EntityIconNewComponent extends BaseItemComponent<EntityItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.entity;

  @Input('entity') override itemKey?: string;

  constructor(_customRegistryService: CustomRegistryService) {
    super(_customRegistryService);
  }

  protected override resolveComponent(item: EntityItem): Type<unknown> | undefined {
    return item.icon;
  }
}
