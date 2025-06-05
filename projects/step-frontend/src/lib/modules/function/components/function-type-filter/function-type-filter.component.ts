import { Component, forwardRef, inject } from '@angular/core';
import {
  ArrayFilterComponent,
  ArrayItemLabelValueExtractor,
  BaseFilterComponent,
  FunctionTypeRegistryService,
  ItemInfo,
} from '@exense/step-core';

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
  standalone: false,
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
