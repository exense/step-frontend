import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { AbstractArtefact } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactFormChangeHelperService } from '../../services/artefact-form-change-helper.service';
import { ArtefactContext } from '../../shared';
import { Subscription } from 'rxjs';

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
