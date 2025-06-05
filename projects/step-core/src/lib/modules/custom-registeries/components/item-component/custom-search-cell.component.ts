import { BaseItemComponent } from './base-item.component';
import { CustomRegistryItem } from '../../shared/custom-registry-item';
import { CustomRegistryType } from '../../shared/custom-registry-type.enum';
import { Component } from '@angular/core';

@Component({
  selector: 'step-search-custom-cell',
  templateUrl: './base-item.component.html',
  styleUrls: [],
  standalone: false,
})
export class CustomSearchCellComponent extends BaseItemComponent<CustomRegistryItem> {
  protected readonly registryType = CustomRegistryType.CUSTOM_SEARCH_CELL;
}
