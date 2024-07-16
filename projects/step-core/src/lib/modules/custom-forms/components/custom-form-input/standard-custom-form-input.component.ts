import {
  AfterContentInit,
  Component,
  DestroyRef,
  forwardRef,
  inject,
  Input,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BaseCustomFormInputComponent } from './base-custom-form-input.component';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

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
export class StandardCustomFormInputComponent extends BaseCustomFormInputComponent implements AfterContentInit {
  @Input() hideLabel?: boolean;
  @Input() hint?: string;
  @Input() required: boolean = false;

  protected _destroyRef = inject(DestroyRef);

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: string[] = [...this.dropdownItems];

  ngAfterContentInit(): void {
    this.dropdownItemsFiltered = [...this.dropdownItems];
    this.filterMultiControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      if (value) {
        this.dropdownItemsFiltered = this.dropdownItems.filter((item) =>
          item.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        this.dropdownItemsFiltered = [...this.dropdownItems];
      }
    });
  }

  loadItems() {
    this.dropdownItemsFiltered = [...this.dropdownItems];
  }
}
