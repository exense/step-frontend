import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, switchMap } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { FilePickerDataProviderService } from '../../injectables/file-picker-data-provider.service';
import { DialogsService, signalFromFormControl, StepBasicsModule } from '../../../basics/step-basics.module';
import { DirectoryListing, FileDescriptor } from '../../../../client/step-client-module';
import { FilePickerModalData } from '../../types/file-picker-modal-data';
import { FilePickerModalResult } from '../../types/file-picker-modal-result';
import { SelectionMode } from '../../types/selection-mode.enum';

@Component({
  selector: 'step-file-picker-modal',
  templateUrl: './file-picker-modal.component.html',
  styleUrl: './file-picker-modal.component.scss',
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePickerModalComponent implements OnInit {
  protected _dialogRef = inject<MatDialogRef<FilePickerModalComponent, FilePickerModalResult>>(MatDialogRef);
  protected readonly _data = inject<FilePickerModalData>(MAT_DIALOG_DATA);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _filePickerDataProviderService = inject(FilePickerDataProviderService);
  private _fb = inject(FormBuilder).nonNullable;

  protected readonly currentDirectory = signal<string | null>(null);
  protected readonly parentDirectory = signal<string | null>(null);
  protected readonly roots = signal<FileDescriptor[]>([]);
  protected readonly showingRoots = signal(false);
  protected readonly files = signal<FileDescriptor[]>([]);
  protected readonly selectedFile = signal<FileDescriptor | null>(null);
  protected readonly selectedPath = computed(() => {
    const file = this.selectedFile();
    return file?.path;
  });

  protected readonly canApply = computed(() => {
    const file = this.selectedFile();
    if (!file) {
      return false;
    }
    const selectionMode = this._data.selectionMode;
    switch (selectionMode) {
      case SelectionMode.FILE:
        return file.regularFile;
      case SelectionMode.DIRECTORY:
        return file.directory;
      default:
        return true;
    }
  });

  protected readonly locationControl = this._fb.control('');

  protected readonly location = signalFromFormControl<string>(this.locationControl);
  protected readonly isLocationButtonDisabled = linkedSignal(() => {
    const location = this.location();
    return !location.trim();
  });

  protected readonly canNavigateUp = computed(() => !!this.parentDirectory() || this.roots().length > 0);

  private _dialogService = inject(DialogsService);

  protected readonly packageForm = this._fb.group({
    name: this._fb.control('', Validators.required),
  });

  ngOnInit(): void {
    this.loadDirectory(this._data.initialDirectory ?? '');
    this._filePickerDataProviderService.getRoots().subscribe({
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

  protected selectFile(file?: FileDescriptor): void {
    if (!file) {
      return;
    }
    this.selectedFile.set(file);
  }

  protected handleLoadDirectory(directory?: FileDescriptor): void {
    if (!directory?.directory) {
      return;
    }
    this.loadDirectory(directory.path!);
  }

  protected apply(): void {
    const file = untracked(() => this.selectedFile());
    const canApply = untracked(() => this.canApply());

    if (!canApply || !file) {
      return;
    }

    let packageName: string | undefined = undefined;

    if (this._data.withName) {
      if (this.packageForm.invalid) {
        this.packageForm.markAllAsTouched();
        return;
      }
      packageName = this.packageForm.value.name!;
    }

    this._dialogRef.close({ packageName, filePath: file.path! });
  }

  protected createDirectory(): void {
    if (!this._data.createFolder) {
      return;
    }
    const currentDirectory = this.currentDirectory();
    if (!currentDirectory) {
      return;
    }

    this._dialogService
      .enterValue('Create Folder', '', { confirmButtonLabel: 'Create', subtitle: `in ${currentDirectory}` })
      .pipe(
        switchMap((name) =>
          this._filePickerDataProviderService
            .createDirectory(currentDirectory, name)
            .pipe(
              switchMap((directory) =>
                this.listDirectory(currentDirectory).pipe(map((result) => ({ result, directory }))),
              ),
            ),
        ),
      )
      .subscribe({
        next: ({ result, directory }) => {
          this.updateStateFromResult(result, currentDirectory);
          if (directory?.path) {
            this.selectedFile.set(directory);
            this.scrollDirectoryIntoView(directory.path);
          }
        },
        error: () => undefined,
      });
  }

  private loadDirectory(directory: string): void {
    this.selectedFile.set(null);
    this.listDirectory(directory).subscribe({
      next: (result) => {
        this.showingRoots.set(false);
        this.updateStateFromResult(result, directory);
      },
      error: () => {
        const currentDirectory = this.currentDirectory() ?? '';
        this.locationControl.setValue(currentDirectory, { emitEvent: false });
        this.isLocationButtonDisabled.set(!currentDirectory);
      },
    });
  }

  private listDirectory(directory: string): Observable<DirectoryListing> {
    const dirsOnly = this._data.selectionMode === SelectionMode.DIRECTORY;
    return this._filePickerDataProviderService.listDirectory(directory, { dirsOnly });
  }

  private showRoots(): void {
    this.selectedFile.set(null);
    this.showingRoots.set(true);
    this.currentDirectory.set(null);
    this.parentDirectory.set(null);
    this.locationControl.setValue('', { emitEvent: false });
    this.isLocationButtonDisabled.set(false);
    this.files.set(this.roots());
  }

  private updateStateFromResult(result: DirectoryListing, baseDirectory: string = '/'): void {
    const currentDirectory = result.path ?? baseDirectory;
    this.currentDirectory.set(currentDirectory);
    this.locationControl.setValue(currentDirectory, { emitEvent: false });
    this.isLocationButtonDisabled.set(!currentDirectory);
    this.parentDirectory.set(result.parentPath || null);
    this.files.set(result.entries || []);
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
