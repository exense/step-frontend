import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  TimeUnit,
  ThreadDistributionWizardDialogComponent,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ThreadGroupArtefact } from '../../types/thread-group.artefact';

@Component({
  selector: 'step-thread-group',
  templateUrl: './thread-group.component.html',
  styleUrls: ['./thread-group.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class ThreadGroupComponent extends BaseArtefactComponent<ThreadGroupArtefact> {
  private _matDialog = inject(MatDialog);

  // eslint-disable-next-line @angular-eslint/prefer-signals -- Retain the existing form query for the base form lifecycle.
  @ViewChild('form')
  protected form!: NgForm;

  protected showLoadDistribution = true;
  protected showDurationParameters = true;

  protected readonly TimeUnit = TimeUnit;

  protected openDistributionWizard(): void {
    this._matDialog
      .open(ThreadDistributionWizardDialogComponent, { data: this.context.artefact })
      .afterClosed()
      .subscribe();
  }
}
