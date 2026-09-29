import { inject, Injectable, Injector, signal, untracked } from '@angular/core';
import {
  AutomationPackageDescriptor,
  FilePickerDataProviderService,
  FilePickerService,
  GlobalReloadService,
  SelectionMode,
  IdeService,
  FilePickerModalResult,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { filter, finalize, map, Observable, switchMap, tap } from 'rxjs';
import { ApAccessHistoryService } from './ap-access-history.service';
import { ApFsDataProviderService } from './ap-fs-data-provider.service';
import { CreatePackageDialogComponent } from '../components/create-package-dialog/create-package-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class IdeStateService {
  private _ideApi = inject(IdeService);
  private _reloadable = inject(GlobalReloadService);
  private _accessHistory = inject(ApAccessHistoryService);
  private _injector = inject(Injector);
  private _matDialog = inject(MatDialog);

  private filePickerInjector = Injector.create({
    providers: [
      {
        provide: FilePickerDataProviderService,
        useExisting: ApFsDataProviderService,
      },
      FilePickerService,
    ],
    parent: this._injector,
  });

  private _filePicker = this.filePickerInjector.get(FilePickerService);

  private readonly inProgressInternal = signal(false);
  readonly inProgress = this.inProgressInternal.asReadonly();

  private readonly currentPackageInternal = signal<AutomationPackageDescriptor | undefined>(undefined);

  readonly currentPackage = this.currentPackageInternal.asReadonly();

  private setPackage(automationPackage: AutomationPackageDescriptor | undefined): void {
    this.currentPackageInternal.set(automationPackage);
    this._reloadable.reloadData();
  }

  get hasPackage(): boolean {
    return untracked(() => {
      const current = this.currentPackage();
      return !!current;
    });
  }

  initialize(): void {
    this.inProgressInternal.set(true);
    this._ideApi
      .getCurrentAp()
      .pipe(
        map((result) => (!result?.directory ? undefined : result)),
        finalize(() => this.inProgressInternal.set(false)),
      )
      .subscribe((currentAp) => this.setPackage(currentAp));
  }

  close(): void {
    this.inProgressInternal.set(true);
    this._ideApi
      .closeAp()
      .pipe(finalize(() => this.inProgressInternal.set(false)))
      .subscribe(() => this.setPackage(undefined));
  }

  create(): void {
    this._matDialog
      .open<CreatePackageDialogComponent, void, boolean>(CreatePackageDialogComponent, {
        injector: this.filePickerInjector,
        panelClass: 'step-create-package-dialog',
        width: '60rem',
        maxWidth: 'calc(100vw - 3.2rem)',
      })
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        tap(() => this.inProgressInternal.set(true)),
        switchMap(() => this._ideApi.getCurrentAp()),
        map((result) => (!result?.directory ? undefined : result)),
        finalize(() => this.inProgressInternal.set(false)),
      )
      .subscribe((result) => {
        this.setPackage(result);
        if (result) {
          this._accessHistory.addToHistory(result);
        }
      });
  }

  openWithPicker(): void {
    this.openPicker('Open Package')
      .pipe(
        filter((result) => !!result),
        tap(() => this.inProgressInternal.set(true)),
        switchMap(({ filePath }) => this._ideApi.useExistingAp(filePath)),
        switchMap(() => this._ideApi.getCurrentAp()),
        map((result) => (!result?.directory ? undefined : result)),
        finalize(() => this.inProgressInternal.set(false)),
      )
      .subscribe((result) => {
        this.setPackage(result);
        if (result) {
          this._accessHistory.addToHistory(result);
        }
      });
  }

  openFromPath(directory: string): void {
    this.inProgressInternal.set(true);
    this._ideApi
      .useExistingAp(directory)
      .pipe(
        switchMap(() => this._ideApi.getCurrentAp()),
        map((result) => (!result?.directory ? undefined : result)),
        finalize(() => this.inProgressInternal.set(false)),
      )
      .subscribe((result) => {
        this.setPackage(result);
        if (result) {
          this._accessHistory.addToHistory(result);
        }
      });
  }

  reload(): void {
    const directory = this.currentPackage()?.directory;
    if (directory && !this.inProgress()) {
      this.openFromPath(directory);
    }
  }

  private openPicker(title: string): Observable<FilePickerModalResult | undefined> {
    return this._filePicker.showFilePicker(title, {
      confirmButtonLabel: 'Select Folder',
      selectionMode: SelectionMode.DIRECTORY,
    });
  }
}
