import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage } from '@exense/step-core';
import { catchError, map, Observable, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
})
export class AutomationPackageUploadDialogComponent {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject(MatDialogRef);

  private _package = inject<AutomationPackage | undefined>(MAT_DIALOG_DATA);

  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formContainer') private formContainer?: NgForm;

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

    if (!this.file) {
      this.formContainer?.form?.markAllAsTouched();
      return;
    }

    const upload = !this._package?.id
      ? this._api.uploadCreateAutomationPackage(this.file)
      : this._api.uploadUpdateAutomationPackage(this._package.id, this.file);

    this.progress$ = upload.progress$;

    upload.response$
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error(err);
          return of(false);
        })
      )
      .subscribe((result) => this._dialogRef.close(result));
  }
}
