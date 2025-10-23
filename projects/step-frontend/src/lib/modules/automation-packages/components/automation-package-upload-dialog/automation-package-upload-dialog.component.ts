import { Component, effect, inject, OnInit } from '@angular/core';
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
} from '@exense/step-core';
import { catchError, map, Observable, of, pipe } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { AutomationPackagePermission } from '../../types/automation-package-permission.enum';

export interface AutomationPackageUploadDialogData {
  automationPackage?: AutomationPackage;
}

type DialogRef = MatDialogRef<AutomationPackageUploadDialogComponent, DialogRouteResult>;

enum UploadType {
  UPLOAD,
  MAVEN,
}

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
  imports: [StepCoreModule, EntityRefDirective],
  hostDirectives: [ReloadableDirective],
  host: {
    '(keydown.enter)': 'upload()',
  },
})
export class AutomationPackageUploadDialogComponent implements OnInit {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;

  protected _package = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA)?.automationPackage;

  protected automationPackage: AutomationPackage = this._package || {};

  protected readonly UploadType = UploadType;
  protected readonly AceMode = AceMode;

  protected readonly isNewPackage = !this.automationPackage.id;
  protected isAffectingOtherPackage = false;

  private effectSwitchTab = effect(() => {
    if (this.apType === UploadType.UPLOAD) {
      this.form.controls.apFile.markAsUntouched();
    } else {
      this.form.controls.apMavenSnippet.markAsUntouched();
    }
  });

  private hasPrefilledAdvancedSettings(): boolean {
    return !!(
      this.automationPackage.version ||
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

  protected readonly dialogTitle = this.isNewPackage
    ? 'New Automation Package'
    : `Edit Automation Package "${this.automationPackage.attributes?.['name'] ?? this.automationPackage.id}"`;

  protected progress$?: Observable<number>;
  protected showAdvancedSettings: boolean = this.hasPrefilledAdvancedSettings();

  protected customPlanAttributes: Partial<Plan> = { attributes: {} };
  protected customKeywordAttributes: Partial<Keyword> = { attributes: {} };
  protected routingCriteria: KeyValue<string, string>[] = this.createTokenSelectionCriteria();

  protected apType: UploadType = UploadType.UPLOAD;
  protected libraryType: UploadType = UploadType.UPLOAD;

  protected form = this._fb.group({
    apFile: this._fb.control(
      this.automationPackage?.automationPackageResource || '',
      this.isNewPackage ? Validators.required : null,
    ),
    apMavenSnippet: this._fb.control('', this.isNewPackage ? Validators.required : null),
    libraryFile: this._fb.control(this.automationPackage?.automationPackageLibraryResource || ''),
    libraryMavenSnippet: this._fb.control(''),
    version: this._fb.control(this.automationPackage.version),
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
  protected readonly routing = this.form.get('routing') as FormArray;

  ngOnInit(): void {
    if (this.automationPackage.functionsAttributes) {
      this.customKeywordAttributes = { attributes: this.automationPackage.functionsAttributes } as Partial<Keyword>;
    }
    if (this.automationPackage.plansAttributes) {
      this.customPlanAttributes = { attributes: this.automationPackage.plansAttributes } as Partial<Plan>;
    }
  }

  protected upload(): void {
    if (this.progress$) {
      return;
    }

    if (this.isNewPackage && this.apType === UploadType.UPLOAD) {
      if (this.form.controls.apFile.invalid) {
        this.form.controls.apFile.markAsTouched();
        return;
      }
    }

    if (this.apType === UploadType.MAVEN && this.form.controls.apMavenSnippet.invalid) {
      this.form.controls.apMavenSnippet.markAsTouched();
      return;
    }

    const {
      version,
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
          routing.filter((kv) => kv.key && kv.key!.trim()).map(({ key, value }) => [key?.trim(), String(value ?? '')]),
        )
      : undefined;

    const automationPackageParams: AutomationPackageParams = {
      id: this.automationPackage.id,
      version,
      activationExpression,
      allowUpdateOfOtherPackages: this.isAffectingOtherPackage,
      functionsAttributes: this.customKeywordAttributes,
      plansAttributes: this.customPlanAttributes,
      tokenSelectionCriteria,
      executeFunctionsLocally,
    };

    if (this.apType === UploadType.UPLOAD) {
      automationPackageParams.apResourceId = apFile;
    } else {
      automationPackageParams.apMavenSnippet = apMavenSnippet;
    }

    if (this.libraryType === UploadType.UPLOAD) {
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

  uploadAutomationPackage(automationPackageParams: AutomationPackageParams): Observable<boolean> {
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
      map(() => true),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    );
  }

  protected toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  addRoutingCriterion() {
    this.routing.push(this._fb.group({ key: '', value: '' }));
  }

  private createTokenSelectionCriteria(): KeyValue<string, string>[] {
    return Object.entries(this.automationPackage.tokenSelectionCriteria || {}).map(
      ([key, value]) => ({ key, value }) as KeyValue<string, string>,
    );
  }

  protected readonly AlertType = AlertType;
  protected readonly AutomationPackagePermission = AutomationPackagePermission;
}
