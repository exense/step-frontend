import { AfterContentInit, Component, DestroyRef, HostListener, inject, TrackByFunction } from '@angular/core';
import { combineLatest, debounceTime, map, Observable, share, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomFormComponent } from '../../../custom-forms';
import { StepBasicsModule, DialogRouteResult } from '../../../basics/step-basics.module';
import { AugmentedPlansService, Plan } from '../../../../client/step-client-module';
import { ItemInfo, PlanTypeRegistryService } from '../../../custom-registeries/custom-registries.module';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'step-plan-create-dialog',
  templateUrl: './plan-create-dialog.component.html',
  styleUrls: ['./plan-create-dialog.component.scss'],
  standalone: true,
  imports: [StepBasicsModule, CustomFormComponent, NgxMatSelectSearchModule],
})
export class PlanCreateDialogComponent implements AfterContentInit {
  private _api = inject(AugmentedPlansService);
  private _matDialogRef = inject<MatDialogRef<PlanCreateDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  protected template: string = 'TestCase';
  protected plan: Partial<Plan> = { attributes: {} };

  readonly trackByItemInfo: TrackByFunction<ItemInfo> = (index, item) => item.type;

  readonly _planTypes = inject(PlanTypeRegistryService).getItemInfos();
  protected planType = this._planTypes.find((planType) => planType.type === 'step.core.plans.Plan')?.type;

  readonly artefactTypes$ = this._api.getArtefactTemplates().pipe(shareReplay(1));

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  filterMultiTypeControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: ItemInfo[] = [];
  dropdownItemsTypeFiltered$: Observable<string[]> | undefined;

  ngAfterContentInit(): void {
    this.dropdownItemsFiltered = [...this._planTypes];
    this.filterMultiControl.valueChanges
      .pipe(
        map((value) => value?.toLowerCase()),
        map((value) =>
          value ? this._planTypes.filter((item) => item.label.toLowerCase().includes(value)) : [...this._planTypes],
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((displayItemsFiltered) => {
        this.dropdownItemsFiltered = displayItemsFiltered;
      });

    this.dropdownItemsTypeFiltered$ = combineLatest([
      this.artefactTypes$,
      this.filterMultiTypeControl.valueChanges.pipe(startWith(this.filterMultiTypeControl.value)),
    ]).pipe(
      takeUntilDestroyed(this._destroyRef),
      map(([artefactTypes, filterValue]) => {
        if (filterValue) {
          return artefactTypes.filter((item) => item.toLowerCase().includes(filterValue.toLowerCase()));
        } else {
          return artefactTypes;
        }
      }),
      share(),
    );
  }

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
