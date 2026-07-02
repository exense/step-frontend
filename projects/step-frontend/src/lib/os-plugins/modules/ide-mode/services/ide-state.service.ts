import {inject, Injectable, signal, untracked} from '@angular/core';
import {AutomationPackageDescriptor, GlobalReloadService, IdeService} from '@exense/step-core';
import {MatDialog} from '@angular/material/dialog';
import {filter, map, Observable, switchMap} from 'rxjs';
import {
  PackageFolderPickerModalComponent,
  PackageFolderPickerModalData,
  PackageFolderPickerModalResult
} from '../components/package-folder-picker-modal/package-folder-picker-modal.component';
import {ApAccessHistoryService} from './ap-access-history.service';

@Injectable({
  providedIn: 'root'
})
export class IdeStateService {
  private _ideApi = inject(IdeService);
  private _matDialog = inject(MatDialog);
  private _reloadable = inject(GlobalReloadService);
  private _accessHistory = inject(ApAccessHistoryService);

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
  };

  initialize(): void {
    this._ideApi
      .getCurrentAp()
      .pipe(
        map((result) => !result?.directory ? undefined : result),
      )
      .subscribe((currentAp) => this.setPackage(currentAp));
  }

  close(): void {
    this._ideApi
      .closeAp()
      .subscribe(() => this.setPackage(undefined));
  }

  create(): void {
    this.openPackageFolderDialog({title: 'Create package', withName: true})
      .pipe(
        filter((result) => !!result),
        switchMap(({directory, name}) => this._ideApi.initializeNewAp(directory, name)),
        switchMap(() => this._ideApi.getCurrentAp()),
        map((result) => !result?.directory ? undefined : result),
      )
      .subscribe((result) => {
        this.setPackage(result)
        if (result) {
          this._accessHistory.addToHistory(result);
        }
      });
  }

  openWithPicker(): void {
    this.openPackageFolderDialog({title: 'Open package'})
      .pipe(
        filter((result) => !!result),
        switchMap(({directory}) => this._ideApi.useExistingAp(directory)),
        switchMap(() => this._ideApi.getCurrentAp()),
        map((result) => !result?.directory ? undefined : result),
      )
      .subscribe((result) => {
        this.setPackage(result)
        if (result) {
          this._accessHistory.addToHistory(result);
        }
      });
  }

  openFromPath(directory: string): void {
    this._ideApi.useExistingAp(directory)
      .pipe(
        switchMap(() => this._ideApi.getCurrentAp()),
        map((result) => !result?.directory ? undefined : result),
      )
      .subscribe((result) => {
        this.setPackage(result)
        if (result) {
          this._accessHistory.addToHistory(result);
        }
      });
  }

  private openPackageFolderDialog(data: PackageFolderPickerModalData): Observable<PackageFolderPickerModalResult | undefined>  {
    return this._matDialog.open<PackageFolderPickerModalComponent, PackageFolderPickerModalData, PackageFolderPickerModalResult>(
      PackageFolderPickerModalComponent,
      {data}
    ).afterClosed();
  }

}
