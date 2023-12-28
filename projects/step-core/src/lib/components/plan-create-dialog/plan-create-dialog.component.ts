import { Component, HostListener, inject, TrackByFunction } from '@angular/core';
import { shareReplay, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { AugmentedPlansService, Plan } from '../../client/step-client-module';
import { ItemInfo, PlanTypeRegistryService } from '../../modules/custom-registeries/custom-registries.module';

@Component({
  selector: 'step-plan-create-dialog',
  templateUrl: './plan-create-dialog.component.html',
  styleUrls: ['./plan-create-dialog.component.scss'],
})
export class PlanCreateDialogComponent {
  private _api = inject(AugmentedPlansService);
  private _matDialogRef = inject<MatDialogRef<PlanCreateDialogComponent>>(MatDialogRef);
  private _router = inject(Router);

  protected template: string = 'TestCase';
  protected plan: Partial<Plan> = { attributes: {} };

  readonly trackByItemInfo: TrackByFunction<ItemInfo> = (index, item) => item.type;

  readonly _planTypes = inject(PlanTypeRegistryService).getItemInfos();
  protected planType = this._planTypes.find((planType) => planType.type === 'step.core.plans.Plan')?.type;

  readonly artefactTypes$ = this._api.getArtefactTemplates().pipe(shareReplay(1));

  @HostListener('keydown.enter')
  save(editAfterSave?: boolean): void {
    this._api
      .newPlan(this.planType, this.template)
      .pipe(
        tap((createdPlan) => {
          createdPlan.attributes = this.plan.attributes;
          if (createdPlan.root) {
            createdPlan.root.attributes = createdPlan.attributes;
          }
        }),
        switchMap((createdPlan) => this._api.savePlan(createdPlan))
      )
      .subscribe((plan) => {
        if (editAfterSave) {
          this._router.navigate(['plans', 'editor', plan.id]);
        }
        this._matDialogRef.close(plan);
      });
  }
}
