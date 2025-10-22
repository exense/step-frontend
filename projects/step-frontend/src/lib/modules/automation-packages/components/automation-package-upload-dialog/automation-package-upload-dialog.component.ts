import { Component, effect, ElementRef, inject, OnInit, Signal, viewChild } from '@angular/core';
import {
  AceMode,
  AlertType,
  AugmentedAutomationPackagesService,
  AutomationPackage,
  AutomationPackageParams,
  DialogRouteResult,
  Keyword,
  Plan,
  ResourceDialogsService,
  StepCoreModule,
} from '@exense/step-core';
import { catchError, filter, map, Observable, of, pipe } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpHeaderResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';

export interface AutomationPackageUploadDialogData {
  automationPackage?: AutomationPackage;
}

type DialogRef = MatDialogRef<AutomationPackageUploadDialogComponent, DialogRouteResult>;

enum UploadType {
  UPLOAD,
  MAVEN,
}

type FileUploadOrMaven = {
  name: string;
  uploadType: UploadType;
  fileInputRef: Signal<ElementRef<HTMLInputElement>>;
  file?: File;
  formControl: FormControl<string>;
};

const AUTOMATION_PACKAGE_LIBRARY_TYPE = 'automationPackageLibrary';
@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
  imports: [StepCoreModule],
  host: {
    '(keydown.enter)': 'upload()',
  },
})
export class AutomationPackageUploadDialogComponent implements OnInit {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;
  private _resourceDialogsService = inject(ResourceDialogsService);

  protected _package = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA)?.automationPackage;

  protected readonly UploadType = UploadType;
  protected readonly AceMode = AceMode;

  protected readonly isNewPackage = !this._package;
  protected isAffectingOtherPackage = false;

  protected form = this._fb.group({
    apFileName: this._fb.control('', this.isNewPackage ? Validators.required : null),
    apMavenSnippet: this._fb.control('', this.isNewPackage ? Validators.required : null),
    libraryFileName: this._fb.control(''),
    libraryMavenSnippet: this._fb.control(''),
    version: this._fb.control(this._package?.version),
    activationExpression: this._fb.control(this._package?.activationExpression?.script),
  });

  private automationPackageFileRef = viewChild.required<ElementRef<HTMLInputElement>>('automationPackageFileInput');
  protected automationPackageFile: FileUploadOrMaven = {
    name: 'automation-package-file',
    uploadType: UploadType.UPLOAD,
    fileInputRef: this.automationPackageFileRef,
    formControl: this.form.controls.apFileName,
  };

  private libraryFileRef = viewChild.required<ElementRef<HTMLInputElement>>('libraryFileInput');
  protected libraryFile: FileUploadOrMaven = {
    name: 'library-file',
    uploadType: UploadType.UPLOAD,
    fileInputRef: this.libraryFileRef,
    formControl: this.form.controls.libraryFileName,
  };

  private effectSwitchTab = effect(() => {
    if (this.automationPackageFile.uploadType === UploadType.UPLOAD) {
      this.form.controls.apFileName.markAsUntouched();
    } else {
      this.form.controls.apMavenSnippet.markAsUntouched();
    }
  });

  private hasPrefilledAdvancedSettings(): boolean {
    return !!(
      this._package?.version ||
      this._package?.activationExpression?.script ||
      this._package?.keywordLibraryResource
    );
  }

  protected readonly dialogTitle = !this._package
    ? 'New Automation Package'
    : `Edit Automation Package "${this._package.attributes?.['name'] ?? this._package.id}"`;

  protected files: Record<string, File> = {};
  protected libraryResourceId?: string;
  protected progress$?: Observable<number>;
  protected showAdvancedSettings: boolean = this.hasPrefilledAdvancedSettings();

  // TODO initialize with data from AP if any
  protected customPlanAttributes: Partial<Plan> = { attributes: {} };
  protected customKeywordAttributes: Partial<Keyword> = { attributes: {} };

  protected toggleMavenUpload(control: FileUploadOrMaven): void {
    control.uploadType = control.uploadType === UploadType.UPLOAD ? UploadType.MAVEN : UploadType.UPLOAD;
  }

  protected openFileChooseDialog(control: FileUploadOrMaven): void {
    control.fileInputRef()?.nativeElement?.click?.();
  }

  ngOnInit(): void {
    if (!this._package) {
      return;
    }
    if (this._package.functionsAttributes) {
      this.customKeywordAttributes = { attributes: this._package.functionsAttributes } as Partial<Keyword>;
    }
    if (this._package.plansAttributes) {
      this.customPlanAttributes = { attributes: this._package.plansAttributes } as Partial<Plan>;
    }
  }

  protected selectFile(control: FileUploadOrMaven): void {
    this.setFile(control, control.fileInputRef()?.nativeElement?.files?.[0] ?? undefined);
  }

  protected setFile(control: FileUploadOrMaven, file?: File) {
    if (!file) {
      return;
    }
    this.files[control.name] = file!;
    control.formControl.setValue(file!.name ?? '');

    if (control.name === 'library-file') {
      this.libraryResourceId = undefined;
    }
  }

  protected handleDrop(control: FileUploadOrMaven, files: FileList | File[]): void {
    const file = Array.isArray(files) ? files[0] : files.item(0);
    if (file) {
      this.setFile(control, file);
    }
  }

  protected upload(): void {
    if (this.progress$) {
      return;
    }

    if (this.automationPackageFile.uploadType === UploadType.UPLOAD) {
      if (!this.files[this.automationPackageFile.name]) {
        this.form.controls.apFileName.setValue('');
      }
      if (this.form.controls.apFileName.invalid) {
        this.form.controls.apFileName.markAsTouched();
        return;
      }
    }

    if (this.automationPackageFile.uploadType === UploadType.MAVEN && this.form.controls.apMavenSnippet.invalid) {
      this.form.controls.apMavenSnippet.markAsTouched();
      return;
    }

    const { version, activationExpression, apMavenSnippet, libraryMavenSnippet } = this.form.value;

    if (this._package?.id && !this.files[this.automationPackageFile.name] && !apMavenSnippet) {
      this._api
        .updateAutomationPackageMetadata(this._package.id, activationExpression, version)
        .subscribe(() => this._dialogRef.close({ isSuccess: true }));
      return;
    }

    const automationPackageParams: AutomationPackageParams = {
      id: this._package?.id,
      apLibraryResourceId: this.libraryResourceId,
      version,
      activationExpression,
      allowUpdateOfOtherPackages: this.isAffectingOtherPackage,
    };

    if (this.automationPackageFile.uploadType === UploadType.UPLOAD) {
      automationPackageParams.apFile = this.files[this.automationPackageFile.name];
    } else {
      automationPackageParams.apMavenSnippet = apMavenSnippet;
    }

    if (this.libraryFile.uploadType === UploadType.UPLOAD) {
      automationPackageParams.apLibrary = this.files[this.libraryFile.name];
    } else {
      automationPackageParams.apLibraryMavenSnippet = libraryMavenSnippet;
    }

    if (this.customKeywordAttributes) {
      automationPackageParams.functionsAttributes = this.customKeywordAttributes;
    }
    if (this.customPlanAttributes) {
      automationPackageParams.plansAttributes = this.customPlanAttributes;
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

  protected selectResource(): void {
    this._resourceDialogsService
      .showSearchResourceDialog(AUTOMATION_PACKAGE_LIBRARY_TYPE)
      .pipe(filter((resourceId) => !!resourceId))
      .subscribe((resourceId) => {
        this.libraryResourceId = resourceId;
        delete this.files[this.libraryFile.name];
        this.libraryFile.formControl.setValue(resourceId);
      });
  }

  protected toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  protected readonly AlertType = AlertType;
}
