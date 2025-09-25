import { Component, effect, ElementRef, inject, InjectionToken, model, Signal, viewChild } from '@angular/core';
import {
  AceMode,
  AugmentedAutomationPackagesService,
  AutomationPackage,
  DialogRouteResult,
  StepCoreModule,
} from '@exense/step-core';
import { catchError, map, Observable, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

export interface AutomationPackageUploadDialogData {
  automationPackage?: AutomationPackage;
}

type DialogRef = MatDialogRef<AutomationPackageUploadDialogComponent, DialogRouteResult>;

enum UploadType {
  UPLOAD,
  MAVEN,
}

type FileUploadOrMaven = {
  uploadType: UploadType;
  fileInputRef: Signal<ElementRef<HTMLInputElement>>;
  file?: File;
  formControl: FormControl<string>;
};

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
  imports: [StepCoreModule],
  host: {
    '(keydown.enter)': 'upload()',
  },
})
export class AutomationPackageUploadDialogComponent {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;

  protected _package = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA)?.automationPackage;

  protected readonly UploadType = UploadType;
  protected readonly AceMode = AceMode;

  protected readonly isNewPackage = !this._package;

  protected form = this._fb.group({
    APFileName: this._fb.control('', this.isNewPackage ? Validators.required : null),
    dependenciesFileName: this._fb.control(''),
    APMavenSnippet: this._fb.control('', this.isNewPackage ? Validators.required : null),
    dependenciesMavenSnippet: this._fb.control(''),
    version: this._fb.control(this._package?.version),
    activationExpression: this._fb.control(this._package?.activationExpression?.script),
  });

  private automationPackageFileRef = viewChild.required<ElementRef<HTMLInputElement>>('automationPackageFileInput');
  protected automationPackageFile: FileUploadOrMaven = {
    uploadType: UploadType.UPLOAD,
    fileInputRef: this.automationPackageFileRef,
    formControl: this.form.controls.APFileName,
  };

  private dependenciesFileRef = viewChild.required<ElementRef<HTMLInputElement>>('dependenciesFileInput');
  protected dependenciesFile: FileUploadOrMaven = {
    uploadType: UploadType.UPLOAD,
    fileInputRef: this.dependenciesFileRef,
    formControl: this.form.controls.APFileName,
  };

  private effectSwitchTab = effect(() => {
    if (this.automationPackageFile.uploadType === UploadType.UPLOAD) {
      this.form.controls.APFileName.markAsUntouched();
    } else {
      this.form.controls.APMavenSnippet.markAsUntouched();
    }
  });

  protected readonly dialogTitle = !this._package
    ? 'New Automation Package'
    : `Edit Automation Package "${this._package.attributes?.['name'] ?? this._package.id}"`;

  protected file?: File;
  protected progress$?: Observable<number>;

  protected toggleMavenUpload(control: FileUploadOrMaven): void {
    control.uploadType = control.uploadType === UploadType.UPLOAD ? UploadType.MAVEN : UploadType.UPLOAD;
  }

  protected openFileChooseDialog(control: FileUploadOrMaven): void {
    control.fileInputRef()?.nativeElement?.click?.();
  }

  protected selectFile(control: FileUploadOrMaven): void {
    this.setFile(control.fileInputRef()?.nativeElement?.files?.[0] ?? undefined);
  }

  protected setFile(file?: File) {
    this.file = file;
    this.form.controls.APFileName.setValue(file?.name ?? '');
  }

  protected handleDrop(files: FileList | File[]): void {
    const file = Array.isArray(files) ? files[0] : files.item(0);
    if (file) {
      this.setFile(file);
    }
  }

  protected upload(): void {
    if (this.progress$) {
      return;
    }

    if (this.automationPackageFile.uploadType === UploadType.UPLOAD) {
      if (!this.file) {
        this.form.controls.APFileName.setValue('');
      }
      if (this.form.controls.APFileName.invalid) {
        this.form.controls.APFileName.markAsTouched();
        return;
      }
    }

    if (this.automationPackageFile.uploadType === UploadType.MAVEN && this.form.controls.APMavenSnippet.invalid) {
      this.form.controls.APMavenSnippet.markAsTouched();
      return;
    }

    const { version, activationExpression, APMavenSnippet } = this.form.value;

    if (this._package?.id && !this.file && !APMavenSnippet) {
      this._api
        .updateAutomationPackageMetadata(this._package.id, activationExpression, version)
        .subscribe(() => this._dialogRef.close({ isSuccess: true }));
      return;
    }

    const upload = this._api.automationPackageCreateOrUpdate({
      id: this._package?.id,
      file: this.file,
      version,
      activationExpression,
      mavenSnippet: APMavenSnippet,
    });

    this.progress$ = upload.progress$;

    upload.response$
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error(err);
          return of(false);
        }),
      )
      .subscribe((result) => this._dialogRef.close({ isSuccess: result }));
  }
}
