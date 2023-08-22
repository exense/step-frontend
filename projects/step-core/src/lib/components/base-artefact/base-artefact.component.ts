import { AfterViewInit, Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AbstractArtefact } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { ArtefactFormChangeHelperService } from '../../services/artefact-form-change-helper.service';
import { ArtefactContext } from '../../shared';

@Component({
  template: '',
})
export abstract class BaseArtefactComponent<T extends AbstractArtefact> implements CustomComponent, AfterViewInit {
  protected _artefactFormChangeHelper = inject(ArtefactFormChangeHelperService);

  protected abstract form: NgForm;

  context!: ArtefactContext<T>;

  contextChange(): void {
    if (this.form) {
      this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
    }
  }

  ngAfterViewInit(): void {
    this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
  }
}
