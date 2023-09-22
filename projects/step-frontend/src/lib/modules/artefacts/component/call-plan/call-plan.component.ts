import { Component, inject, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  AJS_LOCATION,
  ArtefactFormChangeHelperService,
  AugmentedPlansService,
  BaseArtefactComponent,
  DialogsService,
  DynamicValueString,
  LinkProcessorService,
  Plan,
  PlanDialogsService,
} from '@exense/step-core';
import { NgForm } from '@angular/forms';
import { from, map } from 'rxjs';

interface CallPlanArtefact extends AbstractArtefact {
  planId?: string;
  input: DynamicValueString;
}

@Component({
  selector: 'step-call-plan',
  templateUrl: './call-plan.component.html',
  styleUrls: ['./call-plan.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class CallPlanComponent extends BaseArtefactComponent<CallPlanArtefact> {
  private _planApi = inject(AugmentedPlansService);
  private _planDialogs = inject(PlanDialogsService);
  private _linkProcessor = inject(LinkProcessorService);
  private _dialogs = inject(DialogsService);
  private _$location = inject(AJS_LOCATION);

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
      .pipe(map(() => `/root/plans/editor/${this.context.artefact!.planId!}`))
      .subscribe({
        next: (url) => this._$location.path(url),
        error: (error) => this._dialogs.showErrorMsg(error),
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
