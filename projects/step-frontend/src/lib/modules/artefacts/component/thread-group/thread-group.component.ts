import { Component, inject, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  DynamicValueInteger,
  DynamicValueString,
  BaseArtefactComponent,
  TimeUnit,
  ThreadDistributionWizardDialogComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

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
  private _matDialog = inject(MatDialog);

  @ViewChild('form')
  protected form!: NgForm;

  protected showLoadDistribution = true;
  protected showDurationParameters = true;
  protected showHandles = false;

  readonly TimeUnit = TimeUnit;

  openDistributionWizard(): void {
    this._matDialog
      .open(ThreadDistributionWizardDialogComponent, { data: this.context.artefact })
      .afterClosed()
      .subscribe();
  }
}
