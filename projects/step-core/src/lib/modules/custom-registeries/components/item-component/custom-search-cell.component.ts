import { BaseItemComponent } from './base-item.component';
import { CustomRegistryItem } from '../../shared/custom-registry-item';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component } from '@angular/core';
import { CustomRegistryService } from '../../services/custom-registry.service';

@Component({
  selector: 'step-search-custom-cell',
  templateUrl: './base-item.component.html',
  styleUrls: [],
})
export class CustomSearchCellComponent extends BaseItemComponent<CustomRegistryItem> {
  protected readonly registryType = CustomRegistryType.customSearchCell;

  constructor(_customRegistryService: CustomRegistryService) {
    super(_customRegistryService);
  }
}
