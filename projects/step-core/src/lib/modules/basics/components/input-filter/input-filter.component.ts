import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, filter, merge, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-input-filter',
  templateUrl: './input-filter.component.html',
  styleUrls: ['./input-filter.component.scss'],
})
export class InputFilterComponent implements OnInit, OnDestroy, OnChanges {
  private terminator$ = new Subject<void>();

  readonly searchControl = this.createControl();

  @Input() externalSearchValue?: string;
  @Output() searchChange = new EventEmitter<string>();

  constructor(protected formBuilder: FormBuilder) {}

  ngOnInit(): void {
    const initialValue$ = of(this.searchControl.value).pipe(filter((value) => !!value));
    const valueChanges$ = this.searchControl.valueChanges.pipe(debounceTime(200), takeUntil(this.terminator$));

    merge(initialValue$, valueChanges$).subscribe((searchValue) => {
      if (this.searchControl.invalid) {
        return;
      }
      this.searchChange.emit(searchValue);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cExternalSearchValue = changes['externalSearchValue'];
    if (
      cExternalSearchValue?.previousValue !== cExternalSearchValue?.currentValue &&
      cExternalSearchValue?.firstChange
    ) {
      const value = cExternalSearchValue?.currentValue;
      if (value) {
        this.searchControl.setValue(value);
      }
    }
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  protected createControl(): FormControl {
    return this.formBuilder.control('');
  }
}
