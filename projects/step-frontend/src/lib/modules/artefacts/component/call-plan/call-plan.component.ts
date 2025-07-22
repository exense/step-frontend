import { Component, inject, ViewChild } from '@angular/core';
import {
  ArtefactFormChangeHelperService,
  AugmentedPlansService,
  BaseArtefactComponent,
  DialogsService,
  LinkProcessorService,
  Plan,
  PlanDialogsService,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { from, map } from 'rxjs';
import { Router } from '@angular/router';
import { CallPlanArtefact } from '../../types/call-plan.artefact';

@Component({
  selector: 'step-call-plan',
  templateUrl: './call-plan.component.html',
  styleUrls: ['./call-plan.component.scss'],
  providers: [ArtefactFormChangeHelperService],
  standalone: false,
})
export class CallPlanComponent extends BaseArtefactComponent<CallPlanArtefact> {
  private _planApi = inject(AugmentedPlansService);
  private _planDialogs = inject(PlanDialogsService);
  private _linkProcessor = inject(LinkProcessorService);
  private _dialogs = inject(DialogsService);
  private _router = inject(Router);

  planName = '';
  planProject = '';

  @ViewChild('form')
  form!: NgForm;

  selectPlan(): void {
    this._planDialogs.selectPlan().subscribe((plan) => {
      this.context.artefact!.planId = plan.id;
      this.savePlanAttributes(plan);
      this.context.artefact!.attributes!['name'] = this.planName;
      this.context.save();
    });
  }

  gotoPlan(): void {
    if (!this.context.artefact?.planId) {
      return;
    }
    from(this._linkProcessor.process(this.planProject))
      .pipe(map(() => `/plans/editor/${this.context.artefact!.planId!}`))
      .subscribe({
        next: (url) => this._router.navigateByUrl(url),
        error: (error) => this._dialogs.showErrorMsg(error).subscribe(),
      });
  }

  override contextChange() {
    super.contextChange();
    this.loadPlan();
  }

  private loadPlan(): void {
    if (!this.context.artefact?.planId) {
      return;
    }
    this._planApi.getPlanById(this.context.artefact.planId).subscribe((plan) => this.savePlanAttributes(plan));
  }

  private savePlanAttributes(plan?: Plan): void {
    this.planName = plan?.attributes?.['name'] ?? '';
    this.planProject = plan?.attributes?.['project'] ?? '';
  }
}
