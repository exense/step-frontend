import { Component, inject } from '@angular/core';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { Input as ColInput } from '../../../../client/step-client-module';
import { TableSearch } from '../../services/table-search';

@Component({
  selector: 'step-custom-search-dropdown',
  templateUrl: './custom-search-dropdown.component.html',
  styleUrls: ['./custom-search-dropdown.component.scss'],
})
export class CustomSearchDropdownComponent implements CustomComponent {
  private _tableSearch? = inject(TableSearch, { optional: true });
  private contextInternal?: ColInput;

  get context(): ColInput | undefined {
    return this.contextInternal;
  }

  set context(value: ColInput | undefined) {
    if (value === this.contextInternal) {
      return;
    }
    this.contextInternal = value;
    this.updateOptions();
  }

  protected options: string[] = [];

  protected updateOptions(): void {
    this.options = (this.contextInternal?.options || []).map(({ value }) => value!).filter((value) => !!value);
  }

  onItemsChange(value: string): void {
    if (!this._tableSearch || !this.contextInternal?.id) {
      return;
    }
    this._tableSearch.onSearch(this.contextInternal.id, value, true);
  }
}
