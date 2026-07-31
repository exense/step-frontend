import { Component, signal, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogsService, DirectoryListing, FileDescriptor, FilesystemService, StepCoreModule } from '@exense/step-core';
import { switchMap, map, filter } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

export interface PackageFolderPickerModalData {
  initialDirectory?: string;
  title: string;
  withName?: boolean;
}

export interface PackageFolderPickerModalResult {
  name: string;
  directory: string;
}

@Component({
  selector: 'step-package-folder-picker-modal',
  templateUrl: './package-folder-picker-modal.component.html',
  styleUrls: ['./package-folder-picker-modal.component.scss'],
  imports: [StepCoreModule],
})
export class PackageFolderPickerModalComponent implements OnInit {
  protected _dialogRef =
    inject<MatDialogRef<PackageFolderPickerModalComponent, PackageFolderPickerModalResult>>(MatDialogRef);
  protected readonly _data = inject<PackageFolderPickerModalData>(MAT_DIALOG_DATA);
  private _filesystemService = inject(FilesystemService);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly currentPath = signal<string | null>(null);
  protected readonly parentPath = signal<string | null>(null);
  protected readonly items = signal<FileDescriptor[]>([]);
  protected readonly selectedFolder = signal<string | null>(null);
  protected readonly locationControl = this._fb.control('');

  private _dialogService = inject(DialogsService);

  protected readonly packageForm = this._fb.group({
    name: this._fb.control('', Validators.required),
  });

  ngOnInit(): void {
    this.loadDirectory(this._data.initialDirectory ?? '');
  }

  protected loadLocation(): void {
    const path = this.locationControl.value.trim();
    if (path) {
      this.loadDirectory(path);
    }
  }

  protected loadParentDirectory(): void {
    const parentPath = this.parentPath();
    if (parentPath) {
      this.loadDirectory(parentPath);
    }
  }

  protected onSelectFolder(path?: string): void {
    if (!path) {
      return;
    }
    this.selectedFolder.set(path);
  }

  protected onLoadSubfolder(path?: string): void {
    if (!path) {
      return;
    }
    this.loadDirectory(path);
  }

  protected apply(): void {
    const directory = this.selectedFolder() ?? this.currentPath();
    if (!directory) {
      return;
    }

    let name: string = '';

    if (this._data.withName) {
      if (this.packageForm.invalid) {
        this.packageForm.markAllAsTouched();
        return;
      }
      name = this.packageForm.value.name!;
    }

    this._dialogRef.close({ name, directory });
  }

  protected onCreateFolder(): void {
    const currentPath = this.currentPath() ?? '/';
    this._dialogService
      .enterValue('Create Folder', '')
      .pipe(
        filter((name) => !!name),
        switchMap((name) =>
          this._filesystemService
            .createDirectory({
              parentPath: currentPath || undefined,
              name: name,
            })
            .pipe(
              switchMap(() => this._filesystemService.listDirectory(currentPath, false, false, true)),
              map((result) => ({ result, name })),
            ),
        ),
      )
      .subscribe(({ result, name }) => {
        this.updateStateFromResult(result, currentPath);
        this.selectedFolder.set(`${currentPath}/${name}`);
      });
  }

  private loadDirectory(path: string): void {
    this.selectedFolder.set(null);
    this._filesystemService.listDirectory(path, false, false, true).subscribe((result) => {
      this.updateStateFromResult(result, path);
    });
  }

  private updateStateFromResult(result: DirectoryListing, basePath: string = '/'): void {
    const current = result.currentPath ?? basePath;
    this.currentPath.set(current);
    this.locationControl.setValue(current, { emitEvent: false });
    this.parentPath.set(result.parentPath || null);
    this.items.set(result.items || []);
  }
}
