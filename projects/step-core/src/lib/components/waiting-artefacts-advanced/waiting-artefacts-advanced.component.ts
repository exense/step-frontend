import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractArtefact, DynamicValueBoolean } from '../../client/step-client-module';
import { BaseArtefactComponent } from '../base-artefact/base-artefact.component';
import { NgForm } from '@angular/forms';
import { ArtefactContext } from '../../shared';
import { ArtefactFormChangeHelperService } from '../../services/artefact-form-change-helper.service';

export interface WaitingArtefactsAdvancedArtefact extends AbstractArtefact {
  releaseTokens: DynamicValueBoolean;
}

@Component({
  selector: 'step-waiting-artefacts-advanced',
  templateUrl: './waiting-artefacts-advanced.component.html',
  styleUrls: ['./waiting-artefacts-advanced.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class WaitingArtefactsAdvancedComponent
  extends BaseArtefactComponent<WaitingArtefactsAdvancedArtefact>
  implements OnChanges
{
  @Input() override context!: ArtefactContext<WaitingArtefactsAdvancedArtefact>;

  @ViewChild('form')
  protected form!: NgForm;

  protected showAdvancedAttributes = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cContext = changes['context'];
    if (cContext?.previousValue !== cContext?.currentValue || cContext?.firstChange) {
      this.contextChange();
    }
  }
}
