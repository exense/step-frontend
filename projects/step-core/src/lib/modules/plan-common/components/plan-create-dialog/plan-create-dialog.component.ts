import { Component, inject, InjectionToken, viewChild } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { CustomFormComponent } from '../../../custom-forms';
import { StepBasicsModule, DialogRouteResult, ArrayItemLabelValueExtractor } from '../../../basics/step-basics.module';
import { AugmentedPlansService, Plan } from '../../../../client/step-client-module';
import { ItemInfo, PlanTypeRegistryService } from '../../../custom-registeries/custom-registries.module';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Tab, TabsComponent } from '../../../tabs';
import { AceMode, RichEditorComponent } from '../../../rich-editor';
import { DOCUMENT } from '@angular/common';

const TABS = new InjectionToken<Tab<string>[]>('Plan creation tabs', {
  providedIn: 'root',
  factory: () => [
    {
      id: 'general',
      label: 'Create new',
    },
    {
      id: 'yaml',
      label: 'Create from YAML',
    },
  ],
});

@Component({
  selector: 'step-plan-create-dialog',
  templateUrl: './plan-create-dialog.component.html',
  styleUrls: ['./plan-create-dialog.component.scss'],
  imports: [StepBasicsModule, CustomFormComponent, NgxMatSelectSearchModule, TabsComponent, RichEditorComponent],
  host: {
    '(keydown.enter)': 'handleKeyEnter()',
  },
})
export class PlanCreateDialogComponent {
  private _api = inject(AugmentedPlansService);
  private _matDialogRef = inject<MatDialogRef<PlanCreateDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _router = inject(Router);
  private _doc = inject(DOCUMENT);

  private customForm = viewChild(CustomFormComponent);

  protected template: string = 'TestCase';
  protected plan: Partial<Plan> = { attributes: {} };

  protected readonly _planEditorTypes = inject(PlanTypeRegistryService).getItemInfos();
  protected planType = this._planEditorTypes.find((planType) => planType.type === 'step.core.plans.Plan')?.type;
  protected yamlPlan = '';

  protected readonly artefactTypes = toSignal(this._api.getArtefactTemplates(), { initialValue: [] });

  protected _availableTabs = inject(TABS);
  protected selectedTab: string = this._availableTabs[0].id;
  protected readonly AceMode = AceMode;

  protected readonly planEditorTypeExtractor: ArrayItemLabelValueExtractor<ItemInfo, string> = {
    getLabel: (item: ItemInfo) => item.label,
    getValue: (item: ItemInfo) => item.type,
  };

  save(editAfterSave?: boolean): void {
    const createPlan$ = this.selectedTab === 'yaml' ? this.createAsYamlPlan$() : this.createNewPlan$();

    createPlan$
      .pipe(
        switchMap((createdPlan) => this._api.savePlan(createdPlan)), // Common save logic
      )
      .subscribe((plan) => {
        if (editAfterSave) {
          this._router.navigate(['plans', 'editor', plan.id]);
        }
        this._matDialogRef.close({ isSuccess: !!plan, canNavigateBack: !editAfterSave });
      });
  }

  private createAsYamlPlan$(): Observable<any> {
    return this._api.newPlanFromYaml(this.yamlPlan);
  }

  private createNewPlan$(): Observable<any> {
    const planAttributes = this.plan.attributes;
    const planName = this.plan.attributes?.['name'];

    return this.customForm()!
      .readyToProceed()
      .pipe(
        switchMap(() => this._api.newPlan(this.planType, this.template, planName)),
        tap((createdPlan) => {
          createdPlan.attributes = planAttributes;
          if (createdPlan.root) {
            createdPlan.root.attributes = createdPlan.attributes;
          }
        }),
      );
  }

  protected handleKeyEnter(): void {
    const activeElement = this._doc.activeElement as HTMLElement;

    if (this.isInTextEditor(activeElement)) {
      return; // Prevents triggering save when inside a text editor
    }

    this.save(true);
  }

  /**
   * Checks if the current active element is an input, textarea, or a rich text editor.
   */
  private isInTextEditor(element: HTMLElement | null): boolean {
    if (!element) return false;

    if (element.tagName.toLowerCase() === 'textarea') {
      return true;
    }

    // Check if inside a contenteditable or a rich-text editor (Quill, TinyMCE, etc.)
    if (element.isContentEditable) {
      return true;
    }

    return false;
  }
}
