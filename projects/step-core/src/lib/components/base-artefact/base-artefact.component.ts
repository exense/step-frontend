import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  AbstractArtefact,
  DynamicValueBoolean,
  DynamicValueInteger,
  DynamicValueString,
} from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactFormChangeHelperService } from '../../services/artefact-form-change-helper.service';
import { ArtefactContext } from '../../shared';
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

  protected abstract form: NgForm;

  private artefactChangeSubscription?: Subscription;

  context!: ArtefactContext<T>;

  contextChange(): void {
    this.artefactChangeSubscription?.unsubscribe();
    this.artefactChangeSubscription = this.context.artefactChange$.subscribe(() => this.setupFormChanges());
  }

  ngAfterViewInit(): void {
    this.setupFormChanges();
  }

  private setupFormChanges(): void {
    this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
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
}
