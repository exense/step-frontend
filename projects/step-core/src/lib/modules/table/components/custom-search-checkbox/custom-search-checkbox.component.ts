import { Component, inject } from '@angular/core';
import { CustomComponent } from '../../../custom-registeries/shared/custom-component';
import { FilterConditionFactoryService } from '../../services/filter-condition-factory.service';
import { ColInputExt } from '../../types/col-input-ext';

@Component({
  selector: 'step-custom-search-checkbox',
  templateUrl: './custom-search-checkbox.component.html',
  styleUrls: [],
  standalone: false,
})
export class CustomSearchCheckboxComponent implements CustomComponent {
  protected _filterConditionsFactory = inject(FilterConditionFactoryService);
  context?: ColInputExt;
}
