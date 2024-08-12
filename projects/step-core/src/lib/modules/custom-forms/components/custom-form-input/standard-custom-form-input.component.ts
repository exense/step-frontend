import { Component, computed, forwardRef, Input } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { map } from 'rxjs';

@Component({
  selector: 'step-standard-custom-form-inputs',
  templateUrl: './standard-custom-form-input.component.html',
  styleUrls: ['./custom-form-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StandardCustomFormInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [CUSTOM_FORMS_COMMON_IMPORTS, ReactiveFormsModule, FormsModule, NgxMatSelectSearchModule],
})
export class StandardCustomFormInputComponent extends BaseCustomFormInputComponent {
  @Input() hideLabel?: boolean;
  @Input() hint?: string;
  @Input() required: boolean = false;

  readonly filterMultiControl: FormControl<string | null> = new FormControl<string>('');

  private filterValue = toSignal(
    this.filterMultiControl.valueChanges.pipe(
      map((value) => value?.toLowerCase() ?? ''),
      takeUntilDestroyed(),
    ),
    { initialValue: '' },
  );

  protected readonly dropdownItemsFiltered = computed(() => {
    const dropdownItems = this.dropdownItems();
    const filterValue = this.filterValue();
    return !filterValue ? dropdownItems : dropdownItems.filter((item) => item?.toLowerCase().includes(filterValue));
  });
}
