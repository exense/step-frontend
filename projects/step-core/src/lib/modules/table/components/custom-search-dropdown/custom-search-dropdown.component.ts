import { Component, inject } from '@angular/core';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { TableSearch } from '../../services/table-search';
import { ColInputExt } from '../../types/col-input-ext';
import { CustomCellApplySubPathPipe } from '../../pipe/custom-cell-apply-sub-path.pipe';

@Component({
  selector: 'step-custom-search-dropdown',
  templateUrl: './custom-search-dropdown.component.html',
  styleUrls: ['./custom-search-dropdown.component.scss'],
})
export class CustomSearchDropdownComponent implements CustomComponent {
  private _tableSearch? = inject(TableSearch, { optional: true });
  context?: ColInputExt;

  contextChange(previousContext?: ColInputExt, currentContext?: ColInputExt): void {
    if (previousContext === currentContext) {
      return;
    }
    this.updateOptions();
  }

  protected options: string[] = [];

  protected updateOptions(): void {
    this.options = (this.context?.options || []).map(({ value }) => value!).filter((value) => !!value);
  }

  onItemsChange(value: string): void {
    if (!this._tableSearch || !this.context?.id) {
      return;
    }

    const column = CustomCellApplySubPathPipe.transform(this.context.id, this.context.entitySubPath);
    this._tableSearch.onSearch(column, value, true);
  }
}
