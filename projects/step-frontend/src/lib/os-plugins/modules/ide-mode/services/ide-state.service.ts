import { inject, Injectable, Injector, signal, untracked } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  AutomationPackageDescriptor,
  DialogsService,
  FilePickerDataProviderService,
  FilePickerService,
  GlobalReloadService,
  HttpOverrideResponseInterceptorService,
  SelectionMode,
  IdeService,
  FilePickerModalResult,
  IdeStateStrategy,
  DEFAULT_PAGE,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, defer, EMPTY, filter, finalize, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApAccessHistoryService } from './ap-access-history.service';
import { ApFsDataProviderService } from './ap-fs-data-provider.service';
import { CreatePackageDialogComponent } from '../components/create-package-dialog/create-package-dialog.component';
import { IDE_HOME_ROUTE } from '../shared/ide-home-route';

interface IdeAutomationPackageDescriptor extends AutomationPackageDescriptor {
  warnings?: string[];
}

const UPGRADE_REQUIRED_ERROR_NAMES = [
  'LegacyAutomationPackageSchemaVersionSetException',
  'NoAutomationPackageSchemaVersionSetException',
];

@Injectable({
  providedIn: 'root',
})
export class IdeStateService implements IdeStateStrategy {
  private _ideApi = inject(IdeService);
  private _dialogs = inject(DialogsService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _reloadable = inject(GlobalReloadService);
  private _accessHistory = inject(ApAccessHistoryService);
  private _injector = inject(Injector);
  private _matDialog = inject(MatDialog);
  private readonly _router = inject(Router);
  private readonly _defaultPage = inject(DEFAULT_PAGE);

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

  private readonly currentPackageInternal = signal<IdeAutomationPackageDescriptor | undefined>(undefined);

  readonly currentPackage = this.currentPackageInternal.asReadonly();

  private setPackage(automationPackage: IdeAutomationPackageDescriptor | undefined): void {
    this.currentPackageInternal.set(automationPackage);
    this._reloadable.reloadData();
    if (automationPackage && this._router.url === `/${IDE_HOME_ROUTE}`) {
      void this._router.navigateByUrl(this._defaultPage(true));
    }
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
    from(this._router.navigateByUrl(`/${IDE_HOME_ROUTE}`, { replaceUrl: true }))
      .pipe(
        filter((navigated) => navigated),
        switchMap(() => this._ideApi.closeAp()),
        finalize(() => this.inProgressInternal.set(false)),
      )
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
        switchMap(({ filePath }) => this.useExistingAp(filePath)),
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
    this.useExistingAp(directory)
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

  /**
   * A package of an older schema version, or declaring none, is only opened once the user confirmed its upgrade: the
   * returned observable completes without emitting when the upgrade is declined
   */
  private useExistingAp(directory: string): Observable<unknown> {
    return defer(() => {
      let upgradeRequiredMessage: string | undefined;
      this._interceptorOverride.overrideInterceptor(
        catchError((error: unknown) => {
          upgradeRequiredMessage = this.getUpgradeRequiredMessage(error);
          if (upgradeRequiredMessage === undefined) {
            throw error;
          }
          return of(new HttpResponse({ body: null }));
        }),
      );
      return this._ideApi.useExistingAp(directory).pipe(
        switchMap((result) =>
          upgradeRequiredMessage === undefined
            ? of(result)
            : this._dialogs
                .showWarning(upgradeRequiredMessage, {
                  confirmButtonLabel: 'Upgrade',
                  confirmationMessage:
                    'Upgrading will rewrite files in this automation package. This action cannot be undone in Step Studio.',
                  maxWidth: 'min(600px, calc(100vw - 32px))',
                  panelClass: 'step-compact-confirmation-dialog',
                })
                .pipe(switchMap((confirmed) => (confirmed ? this._ideApi.useExistingAp(directory, true) : EMPTY))),
        ),
      );
    });
  }

  private getUpgradeRequiredMessage(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) {
      return undefined;
    }
    let body: unknown = error.error;
    try {
      if (body instanceof ArrayBuffer) {
        body = new TextDecoder('utf-8').decode(new Uint8Array(body));
      }
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
    } catch {
      return undefined;
    }
    const { errorName, errorMessage } = (body ?? {}) as { errorName?: string; errorMessage?: string };
    return errorName && UPGRADE_REQUIRED_ERROR_NAMES.includes(errorName)
      ? errorMessage?.trim() ||
          'This automation package needs a schema upgrade before it can be opened. Upgrade it now?'
      : undefined;
  }

  private openPicker(title: string): Observable<FilePickerModalResult | undefined> {
    return this._filePicker.showFilePicker(title, {
      confirmButtonLabel: 'Select Folder',
      selectionMode: SelectionMode.DIRECTORY,
    });
  }
}
