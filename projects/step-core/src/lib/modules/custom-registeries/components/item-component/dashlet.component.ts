import { BaseItemComponent } from './base-item.component';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component, ViewEncapsulation } from '@angular/core';
import { CustomRegistryService } from '../../services/custom-registry.service';
import { CustomRegistryItem } from '../../shared/custom-registry-item';

@Component({
  selector: 'step-dashlet',
  templateUrl: './base-item.component.html',
  styleUrls: ['./plan-type.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashletComponent extends BaseItemComponent<CustomRegistryItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.dashlet;

  constructor(_customRegistryService: CustomRegistryService) {
    super(_customRegistryService);
  }
}
