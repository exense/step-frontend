import { Component, inject, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  DynamicValueInteger,
  DynamicValueString,
  PlanDialogsService,
  BaseArtefactComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';

interface ThreadGroupArtefact extends AbstractArtefact {
  users: DynamicValueInteger;
  pacing: DynamicValueInteger;
  rampup: DynamicValueInteger;
  pack: DynamicValueInteger;
  startOffset: DynamicValueInteger;
  iterations: DynamicValueInteger;
  maxDuration: DynamicValueInteger;
  localItem: DynamicValueString;
  userItem: DynamicValueString;
  item: DynamicValueString;
}

@Component({
  selector: 'step-thread-group',
  templateUrl: './thread-group.component.html',
  styleUrls: ['./thread-group.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class ThreadGroupComponent extends BaseArtefactComponent<ThreadGroupArtefact> {
  private _planDialogService = inject(PlanDialogsService);

  @ViewChild('form')
  protected form!: NgForm;

  protected showLoadDistribution = true;
  protected showDurationParameters = true;
  protected showHandles = false;

  openDistributionWizard(): void {
    this._planDialogService.openThreadGroupDistributionWizard(this.context.artefact!).subscribe();
  }
}
