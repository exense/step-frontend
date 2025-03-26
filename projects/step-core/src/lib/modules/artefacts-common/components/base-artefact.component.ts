import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { AbstractArtefact, DynamicValue, DynamicValueString } from '../../../client/step-client-module';
import { CustomComponent } from '../../custom-registeries/custom-registries.module';
import { ArtefactFormChangeHelperService, ArtefactContext } from '../../plan-common';
import { Subscription } from 'rxjs';
import { DynamicValuesUtilsService, SimpleValue } from '../../basics/step-basics.module';

@Component({
  template: '',
})
export abstract class BaseArtefactComponent<T extends AbstractArtefact>
  implements CustomComponent, AfterViewInit, OnDestroy
{
  private _dynamicValueUtils = inject(DynamicValuesUtilsService);
  protected _artefactFormChangeHelper = inject(ArtefactFormChangeHelperService);

  protected abstract form: NgForm | FormGroup;

  private artefactChangeSubscription?: Subscription;

  context!: ArtefactContext<T>;

  contextChange(): void {
    this.artefactChangeSubscription?.unsubscribe();
    this.artefactChangeSubscription = this.context.artefactChange$.subscribe(() => this.setupFormChanges());
  }

  ngAfterViewInit(): void {
    this.setupFormChanges();
  }

  protected setupFormChanges(): void {
    const form = this.getFormGroup();
    this._artefactFormChangeHelper.setupFormBehavior(form, () => this.context.save());
  }

  protected determineEmptyGroup(fields: DynamicValue[], emptyValues: SimpleValue[] = [undefined, null, '', 0, false]) {
    const extractValue = (field: DynamicValue): SimpleValue => {
      if (!this._dynamicValueUtils.isDynamicValue(field)) {
        return field as SimpleValue;
      }
      const dynamicField = field as Omit<DynamicValueString, 'value'> & { value: SimpleValue };
      return dynamicField.dynamic ? dynamicField.expression : dynamicField.value;
    };

    for (const field of fields) {
      const fieldValue = extractValue(field);
      if (!emptyValues.includes(fieldValue)) {
        return false;
      }
    }
    return true;
  }

  ngOnDestroy(): void {
    this.artefactChangeSubscription?.unsubscribe();
  }

  private getFormGroup(): FormGroup | undefined {
    if (!this.form) {
      return undefined;
    }
    if (this.form instanceof NgForm) {
      return this.form.form;
    }
    return this.form;
  }
}
