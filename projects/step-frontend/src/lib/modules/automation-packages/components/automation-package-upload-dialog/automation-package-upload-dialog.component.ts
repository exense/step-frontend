import { Component, effect, ElementRef, inject, InjectionToken, model, viewChild } from '@angular/core';
import {
  AceMode,
  AugmentedAutomationPackagesService,
  AutomationPackage,
  DialogRouteResult,
  StepCoreModule,
  Tab,
} from '@exense/step-core';
import { catchError, map, Observable, of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

export interface AutomationPackageUploadDialogData {
  automationPackage?: AutomationPackage;
}

type DialogRef = MatDialogRef<AutomationPackageUploadDialogComponent, DialogRouteResult>;

enum UploadType {
  UPLOAD,
  MAVEN,
}

const TABS = new InjectionToken<Tab<UploadType>[]>('Automation package dialog tabs', {
  providedIn: 'root',
  factory: () => [
    {
      id: UploadType.UPLOAD,
      label: 'Upload automation package',
    },
    {
      id: UploadType.MAVEN,
      label: 'Add maven snippet',
    },
  ],
});

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
  standalone: true,
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
  private fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly UploadType = UploadType;
  protected readonly AceMode = AceMode;

  protected readonly _tabs = inject(TABS);
  protected readonly selectedTab = model(this._tabs[0].id);
  protected readonly isNewPackage = !this._package;

  protected form = this._fb.group({
    fileName: this._fb.control('', this.isNewPackage ? Validators.required : null),
    mavenSnippet: this._fb.control('', this.isNewPackage ? Validators.required : null),
    version: this._fb.control(this._package?.version),
    activationExpression: this._fb.control(this._package?.activationExpression?.script),
  });

  private effectSwitchTab = effect(() => {
    const tab = this.selectedTab();
    if (tab === UploadType.UPLOAD) {
      this.form.controls.fileName.markAsUntouched();
    } else {
      this.form.controls.mavenSnippet.markAsUntouched();
    }
  });

  protected readonly dialogTitle = !this._package
    ? 'New Automation Package'
    : `Edit Automation Package "${this._package.attributes?.['name'] ?? this._package.id}"`;

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

    if (this.selectedTab() === UploadType.UPLOAD) {
      if (!this.file) {
        this.form.controls.fileName.setValue('');
      }
      if (this.form.controls.fileName.invalid) {
        this.form.controls.fileName.markAsTouched();
        return;
      }
    }

    if (this.selectedTab() === UploadType.MAVEN && this.form.controls.mavenSnippet.invalid) {
      this.form.controls.mavenSnippet.markAsTouched();
      return;
    }

    const { version, activationExpression, mavenSnippet } = this.form.value;

    if (this._package?.id && !this.file && !mavenSnippet) {
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
}
