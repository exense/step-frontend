import { Component, forwardRef, inject, TrackByFunction } from '@angular/core';
import { ArrayFilterComponent, BaseFilterComponent, FunctionTypeRegistryService, ItemInfo } from '@exense/step-core';

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
})
export class FunctionTypeFilterComponent extends ArrayFilterComponent implements BaseFilterComponent<string, unknown> {
  readonly _functionTypes = inject(FunctionTypeRegistryService).getItemInfos();
  readonly trackByItemInfo: TrackByFunction<ItemInfo> = (index, item) => item.type;
}
