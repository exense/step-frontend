import {Component, signal, inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {DialogsService, DirectoryListing, FileDescriptor, FilesystemService, StepCoreModule} from '@exense/step-core';
import {switchMap, map, filter} from 'rxjs';

@Component({
  selector: 'step-folder-picker-modal',
  templateUrl: './folder-picker-modal.component.html',
  styleUrls: ['./folder-picker-modal.component.scss'],
  imports: [StepCoreModule],
})
export class FolderPickerModalComponent implements OnInit {
  protected _dialogRef = inject<MatDialogRef<FolderPickerModalComponent, string | null>>(MatDialogRef);
  private _initialPath = inject<string | undefined>(MAT_DIALOG_DATA, { optional: true }) ?? '';
  private _filesystemService = inject(FilesystemService);

  protected readonly currentPath = signal<string | null>(null);
  protected readonly parentPath = signal<string | null>(null);
  protected readonly items = signal<FileDescriptor[]>([]);
  protected readonly selectedFolder = signal<string | null>(null);
  protected readonly pathSegments = signal<string[]>([]);

  private _dialogService = inject(DialogsService);

  ngOnInit(): void {
    this.loadDirectory(this._initialPath);
  }

  protected navigateTo(segmentIndex: number): void {
    const newPath = '/' + this.pathSegments().slice(0, segmentIndex + 1).join('/');
    this.loadDirectory(newPath);
  }

  protected onSelectFolder(path?: string): void {
    if(!path) {
      return;
    }
    this.selectedFolder.set(path);
  }

  protected onLoadSubfolder(path?: string): void {
    if(!path) {
      return;
    }
    this.loadDirectory(path);
  }

  apply(): void {
    const folder = this.selectedFolder();
    if (folder) {
      this._dialogRef.close(folder);
    }
  }

  protected onCreateFolder(): void {
    const currentPath = this.currentPath() ?? '/';
    this._dialogService.enterValue('Create Folder', '')
      .pipe(
        filter(name => !!name),
        switchMap(name => 
          this._filesystemService.createDirectory({
            parentPath: currentPath || undefined,
            name: name
          }).pipe(
            switchMap(() => this._filesystemService.listDirectory(currentPath, false, false, true)),
            map(result => ({ result, name }))
          )
        )
      )
      .subscribe(({ result, name }) => {
        this.updateStateFromResult(result, currentPath);
        this.selectedFolder.set(`${currentPath}/${name}`);
      });
  }

  private loadDirectory(path: string): void {
    this._filesystemService.listDirectory(path, false, false, true).subscribe(result => {
      this.updateStateFromResult(result, path);
    });
  }

  private updateStateFromResult(result: DirectoryListing, basePath: string = '/') : void {
    const current = result.currentPath ?? basePath;
    this.currentPath.set(current);
    this.parentPath.set(result.parentPath || null);
    this.items.set(result.items || []);
    if (current) {
      this.pathSegments.set(current.split('/').filter(Boolean));
    } else {
      this.pathSegments.set([]);
    }
  }
}
