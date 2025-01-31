import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { AbstractArtefact, DynamicValueString } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactFormChangeHelperService } from '../../services/artefact-form-change-helper.service';
import { ArtefactContext } from '../../shared';
import { Subscription } from 'rxjs';
import { ArtefactFieldValue, ArtefactService, SimpleValue } from '../../services/artefact.service';

@Component({
  template: '',
})
export abstract class BaseArtefactComponent<T extends AbstractArtefact>
  implements CustomComponent, AfterViewInit, OnDestroy
{
  private _artefactService = inject(ArtefactService);
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

  protected determineEmptyGroup(
    fields: ArtefactFieldValue[],
    emptyValues: SimpleValue[] = [undefined, null, '', 0, false],
  ) {
    const extractValue = (field: ArtefactFieldValue): SimpleValue => {
      if (!this._artefactService.isDynamicValue(field)) {
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
