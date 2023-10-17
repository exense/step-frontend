import { BaseItemComponent } from './base-item.component';
import { EntityItem } from '../../shared/entity-item';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component, Input } from '@angular/core';
import { CustomRegistryService } from '../../services/custom-registry.service';

@Component({
  selector: 'step-entity',
  templateUrl: './base-item.component.html',
  styleUrls: [],
})
export class EntityComponent extends BaseItemComponent<EntityItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.ENTITY;

  @Input('entity') override itemKey?: string;

  constructor(_customRegistryService: CustomRegistryService) {
    super(_customRegistryService);
  }
}
