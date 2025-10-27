import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AceMode, AugmentedAutomationPackagesService, DialogRouteResult, StepCoreModule } from '@exense/step-core';
import { UploadType } from '../../types/upload-type.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { AutomationPackageResourceType } from '../../types/automation-package-resource-type.enum';
import { MatDialogRef } from '@angular/material/dialog';

type DialogRef = MatDialogRef<unknown, DialogRouteResult>;

@Component({
  selector: 'step-automation-package-resource-upload-dialog',
  imports: [StepCoreModule],
  templateUrl: './automation-package-resource-upload-dialog.component.html',
  styleUrl: './automation-package-resource-upload-dialog.component.scss',
  host: {
    '(keydown.enter)': 'upload()',
  },
})
export class AutomationPackageResourceUploadDialogComponent {
  private _fb = inject(FormBuilder).nonNullable;
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  protected readonly UploadType = UploadType;
  protected readonly selectedType = signal(UploadType.UPLOAD);

  private fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected form = this._fb.group({
    fileName: this._fb.control('', [Validators.required]),
    mavenSnippet: this._fb.control('', [Validators.required]),
  });

  private effectSwitchType = effect(() => {
    const selectedType = this.selectedType();
    if (selectedType === UploadType.UPLOAD) {
      this.form.controls.fileName.markAsUntouched();
    } else {
      this.form.controls.mavenSnippet.markAsUntouched();
    }
  });

  protected file?: File;
  protected progress$?: Observable<number>;

  protected openFileChooseDialog(): void {
    this.fileInput()?.nativeElement?.click?.();
  }

  protected selectFile(): void {
    this.setFile(this.fileInput()?.nativeElement.files?.[0] ?? undefined);
  }

  protected setFile(file?: File) {
    this.file = file;
    this.form.controls.fileName.setValue(file?.name ?? '');
  }

  protected upload(): void {
    if (this.progress$) {
      return;
    }

    if (this.selectedType() === UploadType.UPLOAD) {
      if (!this.file) {
        this.form.controls.fileName.setValue('');
      }
      if (this.form.controls.fileName.invalid) {
        this.form.controls.fileName.markAsTouched();
        return;
      }
    }

    if (this.selectedType() === UploadType.MAVEN && this.form.controls.mavenSnippet.invalid) {
      this.form.controls.mavenSnippet.markAsTouched();
      return;
    }

    const { mavenSnippet } = this.form.value;

    const upload = this._api.createAutomationPackageResource({
      resourceType: AutomationPackageResourceType.AUTOMATION_PACKAGE_LIBRARY,
      resourceFile: this.file,
      mavenSnippet,
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

  protected readonly AceMode = AceMode;
}
