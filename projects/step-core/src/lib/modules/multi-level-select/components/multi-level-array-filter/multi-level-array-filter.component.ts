import { Component, computed, forwardRef, input } from '@angular/core';
import { BaseFilterComponent, StepBasicsModule } from '../../../basics/step-basics.module';
import { MultiLevelSelectComponent } from '../multi-level-select/multi-level-select.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { MultiLevelItem } from '../../types/multi-level-item';
import { MultiLevelArrayItemLabelValueExtractor } from '../../types/multi-level-array-item-label-value-extractor';

@Component({
  selector: 'step-multi-level-array-filter',
  standalone: true,
  imports: [StepBasicsModule, MultiLevelSelectComponent],
  templateUrl: './multi-level-array-filter.component.html',
  styleUrl: './multi-level-array-filter.component.scss',
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => MultiLevelArrayFilterComponent),
    },
  ],
})
export class MultiLevelArrayFilterComponent<T extends string | number | symbol> extends BaseFilterComponent<
  string[],
  T[]
> {
  readonly items = input<MultiLevelItem<T>[]>([]);

  protected readonly extractor: MultiLevelArrayItemLabelValueExtractor<MultiLevelItem<T>, T> = {
    getValue: (item: MultiLevelItem<T>) => item.key,
    getLabel: (item: MultiLevelItem<T>) => item.value,
    getChildren: (item?: MultiLevelItem<T>) => item?.children ?? [],
  };

  protected createControl(fb: FormBuilder): FormControl<T[]> {
    return fb.nonNullable.control([]);
  }

  protected createControlChangeStream(control: FormControl<T[]>): Observable<string[]> {
    return control.valueChanges.pipe(
      map((value) => value as string[]),
      map((values) => {
        if (!values) {
          return values;
        }
        return values.reduce((res, value) => {
          return res.concat([value]);
        }, [] as string[]);
      }),
    );
  }
}
