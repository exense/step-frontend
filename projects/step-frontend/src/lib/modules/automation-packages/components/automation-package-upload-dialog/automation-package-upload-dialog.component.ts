import { Component, effect, ElementRef, inject, InjectionToken, model, Signal, viewChild } from '@angular/core';
import {
  AceMode,
  AugmentedAutomationPackagesService,
  AutomationPackage,
  DialogRouteResult,
  ResourceDialogsService,
  StepCoreModule,
} from '@exense/step-core';
import { catchError, filter, map, Observable, of } from 'rxjs';
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
  name: string;
  uploadType: UploadType;
  fileInputRef: Signal<ElementRef<HTMLInputElement>>;
  file?: File;
  formControl: FormControl<string>;
};

const DEPENDENCIES_NAME = 'dependencies-file';
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
export class AutomationPackageUploadDialogComponent {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder).nonNullable;
  private _resourceDialogsService = inject(ResourceDialogsService);

  protected _package = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA)?.automationPackage;

  protected readonly UploadType = UploadType;
  protected readonly AceMode = AceMode;

  protected readonly isNewPackage = !this._package;

  protected form = this._fb.group({
    apFileName: this._fb.control('', this.isNewPackage ? Validators.required : null),
    apMavenSnippet: this._fb.control('', this.isNewPackage ? Validators.required : null),
    dependenciesFileName: this._fb.control(''),
    dependenciesMavenSnippet: this._fb.control(''),
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

  private dependenciesFileRef = viewChild.required<ElementRef<HTMLInputElement>>('dependenciesFileInput');
  protected dependenciesFile: FileUploadOrMaven = {
    name: DEPENDENCIES_NAME,
    uploadType: UploadType.UPLOAD,
    fileInputRef: this.dependenciesFileRef,
    formControl: this.form.controls.dependenciesFileName,
  };

  private effectSwitchTab = effect(() => {
    if (this.automationPackageFile.uploadType === UploadType.UPLOAD) {
      this.form.controls.apFileName.markAsUntouched();
    } else {
      this.form.controls.apMavenSnippet.markAsUntouched();
    }
  });

  protected readonly dialogTitle = !this._package
    ? 'New Automation Package'
    : `Edit Automation Package "${this._package.attributes?.['name'] ?? this._package.id}"`;

  protected files: Record<string, File> = {};
  protected dependenciesResourceId?: string;
  protected progress$?: Observable<number>;

  protected toggleMavenUpload(control: FileUploadOrMaven): void {
    control.uploadType = control.uploadType === UploadType.UPLOAD ? UploadType.MAVEN : UploadType.UPLOAD;
  }

  protected openFileChooseDialog(control: FileUploadOrMaven): void {
    control.fileInputRef()?.nativeElement?.click?.();
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

    if (control.name === DEPENDENCIES_NAME) {
      this.dependenciesResourceId = undefined;
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

    const { version, activationExpression, apMavenSnippet, dependenciesMavenSnippet } = this.form.value;

    if (this._package?.id && !this.files[this.automationPackageFile.name] && !apMavenSnippet) {
      this._api
        .updateAutomationPackageMetadata(this._package.id, activationExpression, version)
        .subscribe(() => this._dialogRef.close({ isSuccess: true }));
      return;
    }

    const upload = this._api.automationPackageCreateOrUpdate({
      id: this._package?.id,
      apFile: this.files[this.automationPackageFile.name],
      apMavenSnippet: apMavenSnippet,
      keywordLibraryFile: this.files[this.dependenciesFile.name],
      keywordLibraryMavenSnippet: dependenciesMavenSnippet,
      keywordLibraryResourceId: this.dependenciesResourceId,
      version,
      activationExpression,
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

  protected selectResource(): void {
    this._resourceDialogsService
      .showSearchResourceDialog(AUTOMATION_PACKAGE_LIBRARY_TYPE)
      .pipe(filter((resourceId) => !!resourceId))
      .subscribe((resourceId) => {
        this.dependenciesResourceId = resourceId;
        delete this.files[this.dependenciesFile.name];
        this.dependenciesFile.formControl.setValue(resourceId);
      });
  }
}
