import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AugmentedAutomationPackagesService } from '@exense/step-core';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-automation-package-upload-dialog',
  templateUrl: './automation-package-upload-dialog.component.html',
  styleUrls: ['./automation-package-upload-dialog.component.scss'],
})
export class AutomationPackageUploadDialogComponent {
  private _api = inject(AugmentedAutomationPackagesService);
  private _dialogRef = inject(MatDialogRef);

  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  file?: File;
  progress$?: Observable<number>;

  openFileChooseDialog(): void {
    this.fileInput.nativeElement.click();
  }

  selectFile(): void {
    this.file = this.fileInput.nativeElement.files?.[0] ?? undefined;
  }

  upload(): void {
    if (!this.file) {
      return;
    }

    const upload = this._api.uploadAutomationPackage(this.file);
    this.progress$ = upload.progress$;

    upload.response$.subscribe((result) => {
      this._dialogRef.close(result);
    });
  }
}
