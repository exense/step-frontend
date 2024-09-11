import { Component, HostListener, inject, viewChild } from '@angular/core';
import { shareReplay, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomFormComponent } from '../../../custom-forms';
import { StepBasicsModule, DialogRouteResult } from '../../../basics/step-basics.module';
import { AugmentedPlansService, Plan } from '../../../../client/step-client-module';
import { PlanTypeRegistryService } from '../../../custom-registeries/custom-registries.module';

@Component({
  selector: 'step-plan-create-dialog',
  templateUrl: './plan-create-dialog.component.html',
  styleUrls: ['./plan-create-dialog.component.scss'],
  standalone: true,
  imports: [StepBasicsModule, CustomFormComponent],
})
export class PlanCreateDialogComponent {
  private _api = inject(AugmentedPlansService);
  private _matDialogRef = inject<MatDialogRef<PlanCreateDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _router = inject(Router);

  private customForm = viewChild(CustomFormComponent);

  protected template: string = 'TestCase';
  protected plan: Partial<Plan> = { attributes: {} };

  readonly _planTypes = inject(PlanTypeRegistryService).getItemInfos();
  protected planType = this._planTypes.find((planType) => planType.type === 'step.core.plans.Plan')?.type;

  readonly artefactTypes$ = this._api.getArtefactTemplates().pipe(shareReplay(1));

  save(editAfterSave?: boolean): void {
    this.customForm()!
      .readyToProceed()
      .pipe(
        switchMap(() => this._api.newPlan(this.planType, this.template)),
        tap((createdPlan) => {
          createdPlan.attributes = this.plan.attributes;
          if (createdPlan.root) {
            createdPlan.root.attributes = createdPlan.attributes;
          }
        }),
        switchMap((createdPlan) => this._api.savePlan(createdPlan)),
      )
      .subscribe((plan) => {
        if (editAfterSave) {
          this._router.navigate(['plans', 'editor', plan.id]);
        }
        this._matDialogRef.close({ isSuccess: !!plan, canNavigateBack: !editAfterSave });
      });
  }

  @HostListener('keydown.enter')
  private handleKeyEnter(): void {
    this.save(true);
  }
}
