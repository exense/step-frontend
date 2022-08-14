import { BaseItemComponent } from './base-item.component';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component } from '@angular/core';
import { CustomRegistryService } from '../../services/custom-registry.service';
import { CustomRegistryItem } from '../../shared/custom-registry-item';

@Component({
  selector: 'step-function-type',
  templateUrl: './base-item.component.html',
  styleUrls: [],
})
export class FunctionTypeComponent extends BaseItemComponent<CustomRegistryItem> {
  protected override readonly registryType: CustomRegistryType = CustomRegistryType.functionType;

  constructor(_customRegistryService: CustomRegistryService) {
    super(_customRegistryService);
  }
}
