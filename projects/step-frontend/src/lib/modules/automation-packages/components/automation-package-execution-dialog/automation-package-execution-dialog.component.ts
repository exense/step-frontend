import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  AugmentedScreenService,
  AutomationPackage,
  AutomationPackageExecutionParameters,
  AutomationPackagesService,
  PlanFilter,
  PlanFiltersFactoryService,
  StepCoreModule,
} from '@exense/step-core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

interface AutomationPackageExecutionDialogData {
  automationPackage: AutomationPackage;
}

@Component({
  selector: 'step-automation-package-execution-dialog',
  templateUrl: './automation-package-execution-dialog.component.html',
  styleUrl: './automation-package-execution-dialog.component.scss',
  imports: [StepCoreModule],
})
export class AutomationPackageExecutionDialogComponent implements OnInit {
  private _fb = inject(FormBuilder).nonNullable;
  private _destroyRef = inject(DestroyRef);
  private _plansFilterFactory = inject(PlanFiltersFactoryService);
  private _automationPackageApi = inject(AutomationPackagesService);
  private _automationPackage = inject<AutomationPackageExecutionDialogData>(MAT_DIALOG_DATA).automationPackage;
  private _router = inject(Router);
  private _screenTemplates = inject(AugmentedScreenService);
  private _dialogRef = inject(MatDialogRef);

  protected readonly title = `Execute Automation Package: "${this._automationPackage.attributes?.['name']}"`;

  protected readonly executionConfigForm = this._fb.group({
    wrapIntoTestSet: this._fb.control(false),
    numberOfThreads: this._fb.control(1, [Validators.min(1)]),
    includedNames: this._fb.control<string[]>([]),
    excludedNames: this._fb.control<string[]>([]),
    includedCategories: this._fb.control<string[]>([]),
    excludedCategories: this._fb.control<string[]>([]),
  });

  protected readonly executionParameters = toSignal(
    this._screenTemplates.getDefaultParametersByScreenId('executionParameters'),
    { initialValue: undefined },
  );

  ngOnInit(): void {
    this.setupExecutionConfigFormBehavior();
  }

  protected execute(): void {
    if (this.executionConfigForm.invalid) {
      this.executionConfigForm.markAllAsTouched();
      return;
    }
    const params = this.createPackageExecutionParameters();
    this._automationPackageApi
      .executeDeployedAutomationPackage(this._automationPackage.id!, params)
      .subscribe((executionIds) => {
        let navigateTo = '/executions';
        if (executionIds.length === 1) {
          const id = executionIds[0];
          navigateTo = `/executions/${id}`;
        }
        this._router.navigateByUrl(navigateTo);
        this._dialogRef.close(true);
      });
  }

  private createPackageExecutionParameters(): AutomationPackageExecutionParameters {
    const { wrapIntoTestSet, numberOfThreads, includedNames, excludedNames, includedCategories, excludedCategories } =
      this.executionConfigForm.value;

    const filters = [
      !!includedNames?.length ? this._plansFilterFactory.byIncludedNames(includedNames) : undefined,
      !!excludedNames?.length ? this._plansFilterFactory.byExcludedNames(excludedNames) : undefined,
      !!includedCategories?.length ? this._plansFilterFactory.byIncludedCategories(includedCategories) : undefined,
      !!excludedCategories?.length ? this._plansFilterFactory.byExcludedCategories(excludedCategories) : undefined,
    ].filter((item) => !!item) as PlanFilter[];

    const planFilter = !!filters.length ? this._plansFilterFactory.byMultipleFilters(filters) : undefined;
    const customParameters = this.executionParameters();

    return {
      mode: 'RUN',
      planFilter,
      wrapIntoTestSet,
      numberOfThreads,
      customParameters,
    };
  }

  private setupExecutionConfigFormBehavior(): void {
    const ctrlWrapIntoTestSet = this.executionConfigForm.controls.wrapIntoTestSet;
    const ctrlNumberOfThreads = this.executionConfigForm.controls.numberOfThreads;

    ctrlWrapIntoTestSet.valueChanges
      .pipe(startWith(ctrlWrapIntoTestSet.value), takeUntilDestroyed(this._destroyRef))
      .subscribe((wrapIntoTestSet) => {
        if (wrapIntoTestSet) {
          ctrlNumberOfThreads.enable();
        } else {
          ctrlNumberOfThreads.disable();
        }
      });
  }
}
