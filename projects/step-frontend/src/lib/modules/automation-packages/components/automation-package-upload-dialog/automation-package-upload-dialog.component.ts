import { Component, computed, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import {
  AceMode,
  AlertType,
  AugmentedAutomationPackagesService,
  AutomationPackage,
  AutomationPackageParams,
  DialogRouteResult,
  Keyword,
  Plan,
  EntityRefDirective,
  ReloadableDirective,
  StepCoreModule,
  AutomationPackageUpdateResult,
  RichEditorComponent,
  ScreensService,
  ActivationExpressionWizardDialogComponent,
} from '@exense/step-core';
import { catchError, map, Observable, of, pipe, switchMap, take, tap } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';
import { UploadType } from '../../types/upload-type.enum';
import { AutomationPackageResourceType } from '../../types/automation-package-resource-type.enum';
import { AutomationPackageWarningsDialogComponent } from '../automation-package-warnings-dialog/automation-package-warnings-dialog.component';
import { pairRequiredValidator } from '../../validators/pair-required.validators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface AutomationPackageUploadDialogData {
  automationPackage?: AutomationPackage;
}

type DialogRef = MatDialogRef<AutomationPackageUploadDialogComponent, DialogRouteResult>;

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
  imports: [StepCoreModule, EntityRefDirective],
  hostDirectives: [ReloadableDirective],
})
export class AutomationPackageUploadDialogComponent implements OnInit {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;
  private _matDialog = inject(MatDialog);
  private _screenService = inject(ScreensService);

  private apSnippetEditor = viewChild('apSnippetEditor', { read: RichEditorComponent });
  private librarySnippetEditor = viewChild('librarySnippetEditor', { read: RichEditorComponent });

  private _dialogData = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA);

  protected automationPackage: AutomationPackage = this._dialogData.automationPackage ?? {};

  protected readonly UploadType = UploadType;
  protected readonly AceMode = AceMode;
  protected readonly AlertType = AlertType;
  protected readonly AutomationPackagePermission = AutomationPackagePermission;

  protected readonly isNewPackage = !this.automationPackage.id;
  protected isAffectingOtherPackage = false;
  protected readonly existingLibrariesSearchTypes = [
    AutomationPackageResourceType.AUTOMATION_PACKAGE_LIBRARY,
    AutomationPackageResourceType.AUTOMATION_PACKAGE_MANAGED_LIBRARY,
  ];

  private effectSwitchTab = effect(() => {
    const apType = this.apType();
    if (apType === UploadType.UPLOAD) {
      this.form.controls.apFile.markAsUntouched();
    } else {
      this.form.controls.apMavenSnippet.markAsUntouched();
    }
  });

  private effectApSnippetEditorAppears = effect(() => {
    const apSnippetEditor = this.apSnippetEditor();
    apSnippetEditor?.focusOnText?.();
  });

  private effectLibrarySnippetEditorAppears = effect(() => {
    const librarySnippetEditor = this.librarySnippetEditor();
    librarySnippetEditor?.focusOnText?.();
  });

  protected readonly dialogTitle = this.isNewPackage
    ? 'New Automation Package'
    : `Edit Automation Package "${this.automationPackage.attributes?.['name'] ?? this.automationPackage.id}"`;

  protected progress$?: Observable<number>;
  protected showAdvancedSettings = signal(this.hasPrefilledAdvancedSettings());

  protected customPlanAttributes: Partial<Plan> = { attributes: {} };
  protected customKeywordAttributes: Partial<Keyword> = { attributes: {} };
  protected routingCriteria: KeyValue<string, string>[] = this.createTokenSelectionCriteria();

  protected apType = signal(UploadType.UPLOAD);
  protected libraryType = signal(UploadType.UPLOAD);

  protected form = this._fb.group({
    apFile: this._fb.control(this.automationPackage?.automationPackageResource ?? '', Validators.required),
    apMavenSnippet: this._fb.control('', Validators.required),
    libraryFile: this._fb.control(this.automationPackage?.automationPackageLibraryResource ?? ''),
    libraryMavenSnippet: this._fb.control(''),
    versionName: this._fb.control(this.automationPackage.versionName),
    activationExpression: this._fb.control(this.automationPackage.activationExpression?.script),
    executeFunctionsLocally: this._fb.control(this.automationPackage.executeFunctionsLocally ?? false),
    routing: this._fb.array(
      (this.routingCriteria ?? []).map((c) =>
        this._fb.group({
          key: this._fb.control(c.key ?? ''),
          value: this._fb.control(c.value ?? ''),
        }),
      ),
    ),
  });
  private apFileName = toSignal(this.form.controls.apFile.valueChanges, {
    initialValue: this.form.controls.apFile.value,
  });
  protected readonly isApFileEmpty = computed(() => {
    const apFileName = this.apFileName() ?? '';
    return !apFileName.trim();
  });

  private libraryFileName = toSignal(this.form.controls.libraryFile.valueChanges, {
    initialValue: this.form.controls.libraryFile.value,
  });
  protected readonly isLibraryFileEmpty = computed(() => {
    const libraryFileName = this.libraryFileName() ?? '';
    return !libraryFileName.trim();
  });

  protected readonly routing = this.form.get('routing') as FormArray;

  protected readonly versionErrorsDictionary: Record<string, string> = {
    requiredWhenOtherPresent: 'Version name is required when Activation Expression is set.',
  };

  protected readonly activationExpressionErrorDictionary: Record<string, string> = {
    requiredWhenOtherPresent: 'Activation Expression is required when Version name is set.',
  };

  ngOnInit(): void {
    if (this.automationPackage.functionsAttributes) {
      this.customKeywordAttributes = { attributes: this.automationPackage.functionsAttributes } as Partial<Keyword>;
    }
    if (this.automationPackage.plansAttributes) {
      this.customPlanAttributes = { attributes: this.automationPackage.plansAttributes } as Partial<Plan>;
    }

    this.form.addValidators(pairRequiredValidator('versionName', 'activationExpression'));
  }

  protected upload(): void {
    if (this.progress$) {
      return;
    }

    const apType = this.apType();
    if (apType === UploadType.UPLOAD && this.form.controls.apFile.invalid) {
      this.form.controls.apFile.markAsTouched();
      return;
    }

    if (apType === UploadType.MAVEN && this.form.controls.apMavenSnippet.invalid) {
      this.form.controls.apMavenSnippet.markAsTouched();
      return;
    }

    if (this.form.controls.versionName.invalid || this.form.controls.activationExpression.invalid) {
      this.form.controls.versionName.markAsTouched();
      this.form.controls.activationExpression.markAsTouched();
      return;
    }

    const {
      versionName,
      activationExpression,
      apMavenSnippet,
      libraryMavenSnippet,
      executeFunctionsLocally,
      routing,
      libraryFile,
      apFile,
    } = this.form.value;

    // we have routing as array of key-value pairs but BE expects a map with key: value
    const tokenSelectionCriteria = routing
      ? Object.fromEntries(
          routing.filter((kv) => !!kv.key?.trim?.()).map(({ key, value }) => [key?.trim?.(), String(value ?? '')]),
        )
      : undefined;

    const automationPackageParams: AutomationPackageParams = {
      id: this.automationPackage.id,
      versionName,
      activationExpression,
      allowUpdateOfOtherPackages: this.isAffectingOtherPackage,
      functionsAttributes: this.customKeywordAttributes,
      plansAttributes: this.customPlanAttributes,
      tokenSelectionCriteria,
      executeFunctionsLocally,
    };

    if (apType === UploadType.UPLOAD) {
      automationPackageParams.apResourceId = apFile;
    } else {
      automationPackageParams.apMavenSnippet = apMavenSnippet;
    }

    const libraryType = this.libraryType();
    if (libraryType === UploadType.UPLOAD) {
      automationPackageParams.apLibraryResourceId = libraryFile;
    } else {
      automationPackageParams.apLibraryMavenSnippet = libraryMavenSnippet;
    }

    this.uploadAutomationPackage(automationPackageParams).subscribe((result) => {
      if (this.progress$ !== undefined) {
        this._dialogRef.close({ isSuccess: result });
      }
    });
  }

  protected uploadAutomationPackage(automationPackageParams: AutomationPackageParams): Observable<boolean> {
    const upload = this._api
      .overrideInterceptor(
        pipe(
          catchError((error: HttpHeaderResponse) => {
            if (error.status === 409) {
              this.isAffectingOtherPackage = true;
              this.progress$ = undefined;
              const empty = new HttpResponse({ status: HttpStatusCode.NoContent });
              return of(empty);
            }
            throw error;
          }),
        ),
      )
      .automationPackageCreateOrUpdate(automationPackageParams);

    this.progress$ = upload.progress$;

    return upload.response$.pipe(
      tap((response) => this.proceedUploadResult(response)),
      map(() => true),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    );
  }

  protected toggleAdvancedSettings(): void {
    this.showAdvancedSettings.update((value) => !value);
  }

  protected addRoutingCriterion(): void {
    this.routing.push(this._fb.group({ key: '', value: '' }));
  }

  protected addCondition(type?: 'AND' | 'OR'): void {
    this._screenService
      .getScreenInputsByScreenId('executionParameters')
      .pipe(
        take(1),
        switchMap((inputs) =>
          this._matDialog
            .open(ActivationExpressionWizardDialogComponent, {
              data: {
                type,
                inputs,
                initialScript: (this.form.controls.activationExpression.value ?? '') as string,
              },
              width: '50rem',
            })
            .afterClosed(),
        ),
      )
      .subscribe((finalScript?: string) => {
        if (!finalScript) return;
        const ctrl = this.form.controls.activationExpression;
        ctrl?.setValue(finalScript);
        ctrl?.markAsDirty();
        ctrl?.markAsTouched();
        ctrl?.updateValueAndValidity();
      });
  }

  private hasPrefilledAdvancedSettings(): boolean {
    return !!(
      this.automationPackage.versionName ||
      this.automationPackage.activationExpression?.script ||
      this.automationPackage.automationPackageLibraryResource ||
      (this.automationPackage.plansAttributes && Object.keys(this.automationPackage.plansAttributes).length > 0) ||
      (this.automationPackage.functionsAttributes &&
        Object.keys(this.automationPackage.functionsAttributes).length > 0) ||
      (this.automationPackage.tokenSelectionCriteria &&
        Object.keys(this.automationPackage.tokenSelectionCriteria).length > 0) ||
      this.automationPackage.executeFunctionsLocally
    );
  }

  private createTokenSelectionCriteria(): KeyValue<string, string>[] {
    return Object.entries(this.automationPackage.tokenSelectionCriteria || {}).map(
      ([key, value]) => ({ key, value }) as KeyValue<string, string>,
    );
  }

  private proceedUploadResult(response?: string): void {
    if (!response) {
      return;
    }
    let updateResult: AutomationPackageUpdateResult | undefined = undefined;
    try {
      updateResult = JSON.parse(response);
    } catch (e) {}
    const warnings = updateResult?.warnings ?? [];
    if (!warnings.length) {
      return;
    }
    this._matDialog.open(AutomationPackageWarningsDialogComponent, { data: warnings });
  }
}
