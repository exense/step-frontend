import { FormBuilder, FormControl } from '@angular/forms';
import { ChangeDetectorRef, DestroyRef, Directive, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({})
export abstract class BaseFilterComponent<T, CV = T> implements OnInit {
  protected _cd = inject(ChangeDetectorRef);
  protected _formBuilder = inject(FormBuilder);
  protected _destroyRef = inject(DestroyRef);

  readonly filterControl = this.createControl(this._formBuilder);

  readonly invalidFilterMessage$ = this.filterControl.statusChanges.pipe(
    startWith(this.filterControl.status),
    map((status) => {
      if (status !== 'INVALID') {
        return '';
      }
      return this.filterControl.hasError('invalidRegex') ? 'Invalid regular expression' : 'Invalid filter value';
    }),
    distinctUntilChanged(),
    takeUntilDestroyed(),
  );

  protected abstract createControl(fb: FormBuilder): FormControl<CV>;
  protected abstract createControlChangeStream(control: FormControl<CV>): Observable<T>;
  protected handleChange(value: T): void {
    this.filterChange.emit(value);
  }

  protected transformFilterValueToControlValue(value?: T): CV {
    return value as unknown as CV;
  }

  @Output() filterChange = new EventEmitter<T>();

  assignValue(value?: T): void {
    const controlValue = this.transformFilterValueToControlValue(value);
    this.filterControl.setValue(controlValue, { emitEvent: false });
    this._cd.detectChanges();
  }

  ngOnInit(): void {
    this.setupChange();
  }

  protected setupChange(): void {
    this.createControlChangeStream(this.filterControl)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => this.handleChange(value));
  }
}
