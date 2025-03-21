import { FormBuilder, FormControl } from '@angular/forms';
import { ChangeDetectorRef, DestroyRef, Directive, inject, OnDestroy, OnInit, output } from '@angular/core';
import { distinctUntilChanged, map, Observable, startWith, Subject } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Directive({})
export abstract class BaseFilterComponent<T, CV = T> implements OnInit, OnDestroy {
  protected _cd = inject(ChangeDetectorRef);
  protected _formBuilder = inject(FormBuilder);
  protected _destroyRef = inject(DestroyRef);

  private filterChangeInternal$ = new Subject<T>();
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

  readonly invalidFilterMessage = toSignal(this.invalidFilterMessage$, { initialValue: '' });

  protected abstract createControl(fb: FormBuilder): FormControl<CV>;
  protected abstract createControlChangeStream(control: FormControl<CV>): Observable<T>;
  protected handleChange(value: T): void {
    this.filterChange.emit(value);
    this.filterChangeInternal$.next(value);
  }

  protected transformFilterValueToControlValue(value?: T): CV {
    return value as unknown as CV;
  }

  readonly filterChange = output<T>();
  readonly filterChange$ = this.filterChangeInternal$.asObservable();

  assignValue(value?: T): void {
    const controlValue = this.transformFilterValueToControlValue(value);
    this.filterControl.setValue(controlValue, { emitEvent: false });
    this._cd.detectChanges();
  }

  ngOnInit(): void {
    this.setupChange();
  }

  ngOnDestroy(): void {
    this.filterChangeInternal$.complete();
  }

  protected setupChange(): void {
    this.createControlChangeStream(this.filterControl)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => this.handleChange(value));
  }
}
