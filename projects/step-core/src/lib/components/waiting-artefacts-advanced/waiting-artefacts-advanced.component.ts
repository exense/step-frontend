import { Component, inject, Input, OnChanges, SimpleChanges, viewChild } from '@angular/core';
import { AbstractArtefact, DynamicValueBoolean } from '../../client/step-client-module';
import { BaseArtefactComponent } from '../../modules/artefacts-common/components/base-artefact.component';
import { NgForm } from '@angular/forms';
import { ArtefactFormChangeHelperService, ArtefactContext } from '../../modules/plan-common';
import { ArtefactPanelDefaultsService } from '../../modules/artefacts-common/injectables/artefact-panel-defaults.service';

export interface WaitingArtefactsAdvancedArtefact extends AbstractArtefact {
  releaseTokens: DynamicValueBoolean;
}

@Component({
  selector: 'step-waiting-artefacts-advanced',
  templateUrl: './waiting-artefacts-advanced.component.html',
  styleUrls: ['./waiting-artefacts-advanced.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class WaitingArtefactsAdvancedComponent
  extends BaseArtefactComponent<WaitingArtefactsAdvancedArtefact>
  implements OnChanges
{
  private _panelDefaults = inject(ArtefactPanelDefaultsService);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- The base component requires a mutable context for its rendering and form lifecycle.
  @Input() declare context: ArtefactContext<WaitingArtefactsAdvancedArtefact>;

  private readonly formReference = viewChild<NgForm>('form');

  protected get form(): NgForm | undefined {
    return this.formReference();
  }

  protected showAdvancedAttributes = false;

  // eslint-disable-next-line step-lint/component-public-fields -- Custom component rendering invokes this public base-class hook.
  override contextChange(): void {
    super.contextChange();
    const artefact = this.context.artefact;
    this.showAdvancedAttributes = this._panelDefaults.isNonDefault(artefact?.releaseTokens, false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cContext = changes['context'];
    if (cContext?.previousValue !== cContext?.currentValue || cContext?.firstChange) {
      this.contextChange();
    }
  }
}
