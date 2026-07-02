import {effect, inject, Injectable, signal, untracked} from '@angular/core';
import {GlobalReloadService, IdeService} from '@exense/step-core';
import {MatDialog} from '@angular/material/dialog';
import {FolderPickerModalComponent} from '../components/folder-picker-modal/folder-picker-modal.component';
import {filter, switchMap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IdeStateService {
  private _ideApi = inject(IdeService);
  private _matDialog = inject(MatDialog);
  private _reloadable = inject(GlobalReloadService);

  private readonly currentPackageInternal = signal<string | undefined>(undefined);

  readonly currentPackage = this.currentPackageInternal.asReadonly();

  private setPackage(automationPackage: string): void {
    this.currentPackageInternal.set(automationPackage);
    this._reloadable.reloadData();
  }

  get hasPackage(): boolean {
    return untracked(() => {
      const current = this.currentPackage();
      return !!current;
    });
  };

  initialize(): void {
    this._ideApi
      .getCurrentAp()
      .subscribe((currentAp) => this.setPackage(currentAp));
  }

  close(): void {
    this._ideApi
      .closeAp()
      .subscribe(() => this.setPackage(undefined));
  }

  create(): void {
    this._matDialog.open(FolderPickerModalComponent, {data: ''}).afterClosed()
      .pipe(
        filter((folderName) => !!folderName),
        switchMap((folderName) => this._ideApi.initializeNewAp(folderName, 'mayApp')),
        switchMap(() => this._ideApi.getCurrentAp())
      )
      .subscribe((result) => this.setPackage(result));
  }

  open(): void {
    this._matDialog.open(FolderPickerModalComponent, {data: ''}).afterClosed()
      .pipe(
        filter((folderName) => !!folderName),
        switchMap((folderName) => this._ideApi.useExistingAp(folderName)),
        switchMap(() => this._ideApi.getCurrentAp())
      )
      .subscribe((result) => this.setPackage(result));
  }

}
