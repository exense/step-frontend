import { Component, forwardRef, inject } from '@angular/core';
import {
  ArrayFilterComponent,
  ArrayItemLabelValueExtractor,
  BaseFilterComponent,
  StepBasicsModule,
} from '../../../basics/step-basics.module';
import { FunctionTypeRegistryService, ItemInfo } from '../../../custom-registeries/custom-registries.module';

@Component({
  selector: 'step-function-type-filter',
  templateUrl: './function-type-filter.component.html',
  styleUrls: ['./function-type-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => FunctionTypeFilterComponent),
    },
  ],
  imports: [StepBasicsModule],
  standalone: true,
})
export class FunctionTypeFilterComponent
  extends ArrayFilterComponent<ItemInfo>
  implements BaseFilterComponent<string, unknown>
{
  protected readonly _functionTypes = inject(FunctionTypeRegistryService).getItemInfos();

  protected readonly functionTypeExtractor: ArrayItemLabelValueExtractor<ItemInfo, string> = {
    getLabel: (item: ItemInfo) => item.label,
    getValue: (item: ItemInfo) => item.type,
  };
}
