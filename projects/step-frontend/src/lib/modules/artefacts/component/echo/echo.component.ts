import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { AbstractArtefact, ArtefactContext, ArtefactFormChangeHelperService, CustomComponent } from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface EchoArtefact extends AbstractArtefact {
  text: string;
}

@Component({
  selector: 'step-echo',
  templateUrl: './echo.component.html',
  styleUrls: ['./echo.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class EchoComponent implements CustomComponent, AfterViewInit {
  private _artefactFormChangeHelper = inject(ArtefactFormChangeHelperService);

  @ViewChild('form')
  private form!: NgForm;

  context!: ArtefactContext<EchoArtefact>;

  contextChange(): void {
    if (this.form) {
      this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
    }
  }

  ngAfterViewInit(): void {
    this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
  }
}
