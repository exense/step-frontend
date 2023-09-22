import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
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

  ngOnDestroy(): void {
    this.artefactChangeSubscription?.unsubscribe();
  }
}
