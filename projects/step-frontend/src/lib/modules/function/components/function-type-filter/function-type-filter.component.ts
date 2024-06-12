import { AfterViewInit, Component, forwardRef, inject, TrackByFunction } from '@angular/core';
import { ArrayFilterComponent, BaseFilterComponent, FunctionTypeRegistryService, ItemInfo } from '@exense/step-core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class FunctionTypeFilterComponent
  extends ArrayFilterComponent
  implements AfterViewInit, BaseFilterComponent<string, unknown>
{
  readonly _functionTypes = inject(FunctionTypeRegistryService).getItemInfos();
  readonly trackByItemInfo: TrackByFunction<ItemInfo> = (index, item) => item.type;
  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  functionTypesFiltered: ItemInfo[] = [...this._functionTypes];

  ngAfterViewInit(): void {
    this.filterMultiControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      if (value) {
        this.functionTypesFiltered = this._functionTypes.filter((type) =>
          type.label.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        this.functionTypesFiltered = [...this._functionTypes];
      }
    });
  }
}
