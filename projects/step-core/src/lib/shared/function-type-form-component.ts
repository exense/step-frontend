import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CustomComponent } from '../modules/custom-registeries/custom-registries.module';
import { FunctionTypeFormComponentContext } from './function-type-form-component-context.interface';

@Component({
  template: '',
})
export abstract class FunctionTypeFormComponent<T extends FormGroup> implements CustomComponent, OnInit, OnDestroy {
  private readonly terminator$ = new Subject<void>();

  protected abstract formGroup: T;
  protected abstract formGroupValidator: ValidatorFn;

  context!: FunctionTypeFormComponentContext;

  ngOnInit(): void {
    this.context!.formGroup.addValidators(this.formGroupValidator);

    this.context!.formGroup.controls.type.valueChanges.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this.formGroup.reset();
    });

    this.formGroup.valueChanges.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this.context!.formGroup.updateValueAndValidity();
    });

    this.context!.setValueToForm$.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this.setValueToForm();
    });

    this.context!.setValueToModel$.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this.setValueToModel();
    });
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();

    this.context!.formGroup.removeValidators(this.formGroupValidator);
  }

  protected abstract setValueToForm(): void;

  protected abstract setValueToModel(): void;
}
