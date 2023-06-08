import { Component, inject } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactContext,
  CustomComponent,
  DynamicValueInteger,
  DynamicValueString,
  PlanDialogsService,
} from '@exense/step-core';

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
})
export class ThreadGroupComponent implements CustomComponent {
  private _planDialogService = inject(PlanDialogsService);

  context!: ArtefactContext<ThreadGroupArtefact>;

  protected showLoadDistribution = true;
  protected showDurationParameters = true;
  protected showHandles = false;

  openDistributionWizard(): void {
    this._planDialogService.openThreadGroupDistributionWizard(this.context.artefact!).subscribe(() => {
      this.context.save();
    });
  }
}
