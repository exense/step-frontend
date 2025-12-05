import { Component, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import {
  AceMode,
  AugmentedAutomationPackagesService,
  DialogRouteResult,
  Resource,
  StepCoreModule,
  toggleValidators,
} from '@exense/step-core';
import { UploadType } from '../../types/upload-type.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { AutomationPackageResourceType } from '../../types/automation-package-resource-type.enum';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

type DialogRef = MatDialogRef<unknown, DialogRouteResult>;
type DialogData = {
  automationPackageLibrary?: Resource;
};

@Component({
  selector: 'step-automation-package-library-upload-dialog',
  imports: [StepCoreModule],
  templateUrl: './automation-package-library-upload-dialog.component.html',
  styleUrl: './automation-package-library-upload-dialog.component.scss',
  host: {
    '(keydown.enter)': 'upload()',
  },
})
export class AutomationPackageLibraryUploadDialogComponent implements OnInit {
  private _fb = inject(FormBuilder).nonNullable;
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject<DialogRef>(MatDialogRef);
  private _dialogData = inject<DialogData>(MAT_DIALOG_DATA);
  protected readonly UploadType = UploadType;
  protected readonly selectedType = signal(UploadType.UPLOAD);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly displayInput = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly AceMode = AceMode;

  protected readonly form = this._fb.group({
    fileName: this._fb.control(''),
    mavenSnippet: this._fb.control(''),
    isManagedLibrary: this._fb.control(false),
    managedLibraryName: this._fb.control(''),
  });

  protected readonly isManagedLibrary = toSignal(this.form.controls.isManagedLibrary.valueChanges, {
    initialValue: this.form.controls.isManagedLibrary.value,
  });

  private readonly effectSwitchType = effect(() => {
    const selectedType = this.selectedType();
    if (selectedType === UploadType.UPLOAD) {
      toggleValidators(true, this.form.controls.fileName, Validators.required);
      toggleValidators(false, this.form.controls.mavenSnippet, Validators.required);
      this.form.controls.fileName.markAsUntouched();
    } else {
      toggleValidators(false, this.form.controls.fileName, Validators.required);
      toggleValidators(true, this.form.controls.mavenSnippet, Validators.required);
      this.form.controls.mavenSnippet.markAsUntouched();
    }
  });

  private readonly effectToggleManagedLibrary = effect(() => {
    const isManagedLibrary = this.isManagedLibrary();
    if (isManagedLibrary) {
      toggleValidators(true, this.form.controls.managedLibraryName, Validators.required);
      this.form.controls.managedLibraryName.markAsUntouched();
    } else {
      toggleValidators(false, this.form.controls.managedLibraryName, Validators.required);
    }
  });

  protected file?: File;
  protected progress$?: Observable<number>;

  ngOnInit(): void {
    const library = this._dialogData.automationPackageLibrary;
    if (library) {
      this.setFormValue(library);
    }
  }

  protected openFileChooseDialog(): void {
    this.fileInput()?.nativeElement?.click?.();
  }

  protected selectFile(): void {
    this.setFile(this.fileInput()?.nativeElement.files?.[0] ?? undefined);
  }

  protected handleUploadContainerFileChange(files?: File[]): void {
    this.setFile(files?.[0]);
  }

  protected handleDropAreaActiveChange(isActive: boolean): void {
    const element = this.displayInput()?.nativeElement;
    if (isActive) {
      element?.focus?.();
    } else {
      element?.blur?.();
    }
  }

  protected upload(): void {
    if (this.progress$) {
      return;
    }

    if (this.selectedType() === UploadType.UPLOAD) {
      if (!this.file) {
        this.form.controls.fileName.setValue('');
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { mavenSnippet, isManagedLibrary, managedLibraryName } = this.form.value;
    const resourceType = isManagedLibrary
      ? AutomationPackageResourceType.AUTOMATION_PACKAGE_MANAGED_LIBRARY
      : AutomationPackageResourceType.AUTOMATION_PACKAGE_LIBRARY;

    const id = this._dialogData?.automationPackageLibrary?.id;
    const upload = this._api.createOrUpdateAutomationPackageResource({
      id,
      resourceType,
      resourceFile: this.file,
      mavenSnippet,
      managedLibraryName,
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

  private setFile(file?: File) {
    this.file = file;
    this.form.controls.fileName.setValue(file?.name ?? '');
  }

  private setFormValue(libraryResource: Resource): void {
    if (libraryResource.resourceType !== AutomationPackageResourceType.AUTOMATION_PACKAGE_MANAGED_LIBRARY) {
      throw new Error(
        `Only '${AutomationPackageResourceType.AUTOMATION_PACKAGE_MANAGED_LIBRARY}' are supported for editing.`,
      );
    }
    this.form.controls.isManagedLibrary.setValue(true);
    this.form.controls.isManagedLibrary.disable();
    this.form.controls.managedLibraryName.setValue(libraryResource?.resourceName ?? '');
  }
}
