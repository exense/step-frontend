import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormGroup } from '@angular/forms';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { v4 } from 'uuid';
import { FunctionTypeParentFormService } from '../../injectables/function-type-parent-form.service';

@Component({
  template: '',
  standalone: false,
})
export abstract class FunctionTypeFormComponent<T extends FormGroup>
  implements CustomComponent, OnInit, AfterViewInit, OnDestroy
{
  protected _parent = inject(FunctionTypeParentFormService);
  private functionTypeCtrlName = `functionType_${v4()}`;

  protected abstract formGroup: T;

  context?: unknown;

  ngOnInit(): void {
    (this._parent.formGroup as UntypedFormGroup).addControl(this.functionTypeCtrlName, this.formGroup);
  }

  ngAfterViewInit(): void {
    this.setValueToForm();
  }

  ngOnDestroy(): void {
    (this._parent.formGroup as UntypedFormGroup).removeControl(this.functionTypeCtrlName);
  }

  abstract setValueToForm(): void;

  abstract setValueToModel(): void;
}
