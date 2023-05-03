import { FormBuilder, FormControl } from '@angular/forms';
import { Directive, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

@Directive({})
export abstract class BaseFilterComponent<T, CV = T> implements OnInit, OnDestroy {
  protected _formBuilder = inject(FormBuilder);

  readonly filterControl = this.createControl(this._formBuilder);

  protected terminator$ = new Subject<void>();
  protected abstract createControl(fb: FormBuilder): FormControl<CV>;
  protected abstract createControlChangeStream(control: FormControl<CV>): Observable<T>;
  protected handleChange(value: T): void {
    this.filterChange.emit(value);
  }

  protected transformFilterValueToControlValue(value: T): CV {
    return value as unknown as CV;
  }

  @Output() filterChange = new EventEmitter<T>();

  assignValue(value: T): void {
    const controlValue = this.transformFilterValueToControlValue(value);
    this.filterControl.setValue(controlValue, { emitEvent: false });
  }

  ngOnInit(): void {
    this.setupChange();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  private setupChange(): void {
    this.createControlChangeStream(this.filterControl)
      .pipe(takeUntil(this.terminator$))
      .subscribe((value) => this.handleChange(value));
  }
}
