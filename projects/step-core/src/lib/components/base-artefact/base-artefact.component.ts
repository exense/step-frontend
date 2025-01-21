import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import {
  AbstractArtefact,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
} from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactFormChangeHelperService, ArtefactContext } from '../../modules/plan-common';
import { Subscription } from 'rxjs';

type SimpleValue = undefined | null | string | boolean | number;
type PossibleField = SimpleValue | DynamicValueString | DynamicValueInteger | DynamicValueBoolean;

@Component({
  template: '',
})
export abstract class BaseArtefactComponent<T extends AbstractArtefact>
  implements CustomComponent, AfterViewInit, OnDestroy
{
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

  protected determineEmptyGroup(fields: PossibleField[], emptyValues: SimpleValue[] = [undefined, null, '', 0, false]) {
    const isDynamic = (field: PossibleField) =>
      !!field && field.hasOwnProperty('dynamic') && field.hasOwnProperty('value') && field.hasOwnProperty('expression');

    const extractValue = (field: PossibleField): SimpleValue => {
      if (!isDynamic(field)) {
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
