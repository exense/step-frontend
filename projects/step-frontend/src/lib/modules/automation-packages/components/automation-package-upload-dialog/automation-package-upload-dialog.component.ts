import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage, DialogRouteResult } from '@exense/step-core';
import { catchError, map, Observable, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

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

  protected _package = inject<AutomationPackageUploadDialogData>(MAT_DIALOG_DATA)?.automationPackage;

  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formContainer') private formContainer?: NgForm;

  readonly newPackage = !this._package;
  readonly dialogTitle = !this._package
    ? 'Upload New Automation Package'
    : `Upload new file for "${this._package.attributes?.['name'] ?? this._package.id}"`;

  file?: File;
  progress$?: Observable<number>;

  openFileChooseDialog(): void {
    this.fileInput.nativeElement.click();
  }

  selectFile(): void {
    this.file = this.fileInput.nativeElement.files?.[0] ?? undefined;
  }

  handleDrop(file?: File[]): void {
    this.file = file?.[0] ?? undefined;
  }

  @HostListener('keydown.enter')
  upload(): void {
    if (this.progress$) {
      return;
    }

    if (this.file) {
      const upload = !this._package?.id
        ? this._api.uploadCreateAutomationPackage(
            this.file,
            this._package?.version,
            this._package?.activationExpression?.script,
          )
        : this._api.uploadUpdateAutomationPackage(
            this._package.id,
            this.file,
            this._package?.version,
            this._package?.activationExpression?.script,
          );

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
        .updateAutomationPackageMetadata(
          this._package?.id,
          this._package?.activationExpression?.script,
          this._package?.version,
        )
        .subscribe(() => this._dialogRef.close({ isSuccess: true }));
    }
  }

  setVersion(version: string) {
    if (!this._package) {
      this._package = {};
    }
    this._package.version = version;
  }

  setActivationExpression(script: string) {
    if (!this._package) {
      this._package = {};
    }
    if (!this._package.activationExpression) {
      this._package.activationExpression = {};
    }
    this._package.activationExpression.script = script;
  }
}
