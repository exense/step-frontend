import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactContext,
  ArtefactFormChangeHelperService,
  CustomComponent,
  DynamicValueInteger,
  DynamicValueString,
  PlanDialogsService,
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
export class ThreadGroupComponent implements CustomComponent, AfterViewInit {
  private _planDialogService = inject(PlanDialogsService);
  private _artefactFormChangeHelper = inject(ArtefactFormChangeHelperService);

  @ViewChild('form')
  private form!: NgForm;

  context!: ArtefactContext<ThreadGroupArtefact>;

  protected showLoadDistribution = true;
  protected showDurationParameters = true;
  protected showHandles = false;

  ngAfterViewInit(): void {
    this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
  }

  contextChange(): void {
    if (this.form) {
      this._artefactFormChangeHelper.setupFormBehavior(this.form, () => this.context.save());
    }
  }

  openDistributionWizard(): void {
    this._planDialogService.openThreadGroupDistributionWizard(this.context.artefact!).subscribe();
  }
}
