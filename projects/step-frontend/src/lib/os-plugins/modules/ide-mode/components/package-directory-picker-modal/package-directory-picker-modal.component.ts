import { Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogsService, DirectoryListing, FileDescriptor, FilesystemService, StepCoreModule } from '@exense/step-core';
import { switchMap, map } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

export interface PackageDirectoryPickerModalData {
  initialDirectory?: string;
  title: string;
  withName?: boolean;
}

export interface PackageDirectoryPickerModalResult {
  name: string;
  directory: string;
}

@Component({
  selector: 'step-package-directory-picker-modal',
  templateUrl: './package-directory-picker-modal.component.html',
  styleUrls: ['./package-directory-picker-modal.component.scss'],
  imports: [StepCoreModule],
})
export class PackageDirectoryPickerModalComponent implements OnInit {
  protected _dialogRef =
    inject<MatDialogRef<PackageDirectoryPickerModalComponent, PackageDirectoryPickerModalResult>>(MatDialogRef);
  protected readonly _data = inject<PackageDirectoryPickerModalData>(MAT_DIALOG_DATA);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _filesystemService = inject(FilesystemService);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly currentDirectory = signal<string | null>(null);
  protected readonly parentDirectory = signal<string | null>(null);
  protected readonly roots = signal<FileDescriptor[]>([]);
  protected readonly showingRoots = signal(false);
  protected readonly directories = signal<FileDescriptor[]>([]);
  protected readonly selectedDirectory = signal<string | null>(null);
  protected readonly locationControl = this._fb.control('');
  protected readonly canNavigateUp = computed(() => !!this.parentDirectory() || this.roots().length > 0);

  private _dialogService = inject(DialogsService);

  protected readonly packageForm = this._fb.group({
    name: this._fb.control('', Validators.required),
  });

  ngOnInit(): void {
    this.loadDirectory(this._data.initialDirectory ?? '');
    this._filesystemService.getRoots().subscribe({
      next: (roots) => this.roots.set(roots),
      error: () => this.roots.set([]),
    });
  }

  protected loadLocation(): void {
    const directory = this.removeTrailingSlash(this.locationControl.value.trim());
    if (directory) {
      this.locationControl.setValue(directory, { emitEvent: false });
      this.loadDirectory(directory);
    }
  }

  protected loadParentDirectory(): void {
    const parentDirectory = this.parentDirectory();
    if (parentDirectory) {
      this.loadDirectory(parentDirectory);
    } else if (this.roots().length > 0) {
      this.showRoots();
    }
  }

  protected onSelectDirectory(directory?: string): void {
    if (!directory) {
      return;
    }
    this.selectedDirectory.set(directory);
  }

  protected onLoadDirectory(directory?: string): void {
    if (!directory) {
      return;
    }
    this.loadDirectory(directory);
  }

  protected apply(): void {
    const directory = this.selectedDirectory();
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

  protected onCreateDirectory(): void {
    const currentDirectory = this.currentDirectory();
    if (!currentDirectory) {
      return;
    }

    this._dialogService
      .enterValue('Create Folder', '', { confirmButtonLabel: 'Create', subtitle: `in ${currentDirectory}` })
      .pipe(
        switchMap((name) =>
          this._filesystemService
            .createDirectory({
              parentPath: currentDirectory,
              name: name,
            })
            .pipe(
              switchMap((directory) =>
                this._filesystemService
                  .listDirectory(currentDirectory, false, false, true)
                  .pipe(map((result) => ({ result, directory }))),
              ),
            ),
        ),
      )
      .subscribe({
        next: ({ result, directory }) => {
          this.updateStateFromResult(result, currentDirectory);
          const directoryPath = directory.absolutePath;
          if (directoryPath) {
            this.selectedDirectory.set(directoryPath);
            this.scrollDirectoryIntoView(directoryPath);
          }
        },
        error: () => undefined,
      });
  }

  private loadDirectory(directory: string): void {
    this.selectedDirectory.set(null);
    this._filesystemService.listDirectory(directory, false, false, true).subscribe({
      next: (result) => {
        this.showingRoots.set(false);
        this.updateStateFromResult(result, directory);
      },
      error: () => {
        this.locationControl.setValue(this.currentDirectory() ?? '', { emitEvent: false });
      },
    });
  }

  private showRoots(): void {
    this.selectedDirectory.set(null);
    this.showingRoots.set(true);
    this.currentDirectory.set(null);
    this.parentDirectory.set(null);
    this.locationControl.setValue('', { emitEvent: false });
    this.directories.set(this.roots());
  }

  private updateStateFromResult(result: DirectoryListing, baseDirectory: string = '/'): void {
    const currentDirectory = result.currentPath ?? baseDirectory;
    this.currentDirectory.set(currentDirectory);
    this.locationControl.setValue(currentDirectory, { emitEvent: false });
    this.parentDirectory.set(result.parentPath || null);
    this.directories.set(result.items || []);
  }

  private removeTrailingSlash(directory: string): string {
    const normalized = directory.replace(/\\/g, '/');
    if (normalized === '/' || /^[a-zA-Z]:\/$/.test(normalized)) {
      return normalized;
    }
    return normalized.replace(/\/+$/, '');
  }

  private scrollDirectoryIntoView(directory: string, attempt: number = 0): void {
    const directoryList = this._elementRef.nativeElement.querySelector<HTMLDivElement>('.directory-list');
    const directoryItem = Array.from(directoryList?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(
      (item) => item.dataset['directory'] === directory,
    );
    if (!directoryItem || !directoryList) {
      if (attempt < 5) {
        requestAnimationFrame(() => this.scrollDirectoryIntoView(directory, attempt + 1));
      }
      return;
    }

    const directoryListBounds = directoryList.getBoundingClientRect();
    const directoryItemBounds = directoryItem.getBoundingClientRect();
    const scrollOffset =
      directoryItemBounds.top < directoryListBounds.top
        ? directoryItemBounds.top - directoryListBounds.top
        : directoryItemBounds.bottom - directoryListBounds.bottom;
    directoryList.scrollTo({
      top: directoryList.scrollTop + scrollOffset,
      behavior: 'smooth',
    });
  }
}
