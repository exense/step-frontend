import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage, DialogRouteResult } from '@exense/step-core';
import { catchError, map, Observable, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';

export interface AutomationPackageUploadDialogData {
  automationPackage?: AutomationPackage;
}

type DialogRef = MatDialogRef<AutomationPackageUploadDialogComponent, DialogRouteResult>;

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
})
export class AutomationPackageUploadDialogComponent {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _fb = inject(FormBuilder);

  protected _package = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA)?.automationPackage;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formContainer') private formContainer?: NgForm;

  protected form: FormGroup = this._fb.group({
    fileName: [{ value: '', disabled: true }],
    version: [this._package?.version || null],
    activationExpression: [this._package?.activationExpression?.script || null],
  });
  readonly isNewPackage = !this._package;
  readonly dialogTitle = !this._package
    ? 'Upload New Automation Package'
    : `Upload new file for "${this._package.attributes?.['name'] ?? this._package.id}"`;

  file?: File;
  progress$?: Observable<number>;

  openFileChooseDialog(): void {
    this.fileInput.nativeElement.click();
  }

  selectFile(): void {
    this.setFile(this.fileInput.nativeElement.files?.[0] ?? undefined);
  }

  setFile(file?: File) {
    this.file = file;
    this.form.get('fileName')?.setValue(file?.name);
  }

  handleDrop(files: FileList | File[]): void {
    const file = Array.isArray(files) ? files[0] : files.item(0);
    if (file) {
      this.setFile(file);
    }
  }

  @HostListener('keydown.enter')
  upload(): void {
    if (this.progress$) {
      return;
    }

    const version = this.form.get('version')?.value;
    const activationExpression = this.form.get('activationExpression')?.value;

    if (this.file) {
      const upload = !this._package?.id
        ? this._api.uploadCreateAutomationPackage(this.file, version, activationExpression)
        : this._api.uploadUpdateAutomationPackage(this._package.id, this.file, version, activationExpression);

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
    } else if (this._package?.id) {
      this._api
        .updateAutomationPackageMetadata(this._package?.id, activationExpression, version)
        .subscribe(() => this._dialogRef.close({ isSuccess: true }));
    }
  }
}
