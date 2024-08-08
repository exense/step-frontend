import { Component, inject } from '@angular/core';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { ColInputExt } from '../../types/col-input-ext';
import { FilterConditionFactoryService } from '../../services/filter-condition-factory.service';

@Component({
  selector: 'step-custom-search-dropdown',
  templateUrl: './custom-search-dropdown.component.html',
  styleUrls: ['./custom-search-dropdown.component.scss'],
})
export class CustomSearchDropdownComponent implements CustomComponent {
  protected _filterConditionsFactory = inject(FilterConditionFactoryService);
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
}
