import { Component, effect, inject, model, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FunctionPackageConfigurationDialogData } from '../../types/function-package-configuration-dialog-data.interface';
import {
  AlertType,
  AugmentedKeywordPackagesService,
  DialogRouteResult,
  Keyword,
  ResourceInputBridgeService,
  CustomFormComponent,
  ResourceInputUtilsService,
} from '@exense/step-core';
import { catchError, debounceTime, filter, iif, map, of, switchMap, tap } from 'rxjs';
import { KeyValue } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-function-package-configuration-dialog',
  templateUrl: './function-package-configuration-dialog.component.html',
  styleUrls: ['./function-package-configuration-dialog.component.scss'],
  host: {
    '(keydown.enter)': 'save()',
  },
})
export class FunctionPackageConfigurationDialogComponent {
  readonly AlertType = AlertType;

  private _api = inject(AugmentedKeywordPackagesService);
  private _matDialogRef = inject<MatDialogRef<FunctionPackageConfigurationDialogData, DialogRouteResult>>(MatDialogRef);
  protected _data = inject<FunctionPackageConfigurationDialogData>(MAT_DIALOG_DATA, { optional: true });
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);
  private _resourceInputUtils = inject(ResourceInputUtilsService);

  private customForm = viewChild('customAttributesForm', { read: CustomFormComponent });

  readonly modalTitle = `${this._data?.functionPackage ? 'Edit' : 'New'} Keyword Package`;

  protected functionPackage = this._data?.functionPackage ?? { packageAttributes: {} };
  protected customAttributes = { attributes: this.functionPackage.packageAttributes };

  protected readonly packageLocation = model(this.functionPackage?.packageLocation);
  protected readonly packageLibrariesLocation = model(this.functionPackage?.packageLibrariesLocation);

  private effectSyncPackageLocation = effect(() => {
    this.functionPackage.packageLocation = this.packageLocation();
    // Immediately load preview, if value is valid resource id
    if (this._resourceInputUtils.isResourceValue(this.functionPackage.packageLocation)) {
      this.loadPackagePreview();
    }
  });

  private effectSyncPackageLibrariesLocation = effect(() => {
    this.functionPackage.packageLibrariesLocation = this.packageLibrariesLocation();
    // Immediately load preview, if value is valid resource id
    if (this._resourceInputUtils.isResourceValue(this.functionPackage.packageLibrariesLocation)) {
      this.loadPackagePreview();
    }
  });

  /**
   * Debounced version for manual input of absolute resource's location
   * **/
  private subscriptionSyncPackageLocationDebounced = toObservable(this.packageLocation)
    .pipe(
      filter((value) => !!value && !this._resourceInputUtils.isResourceValue(value)),
      debounceTime(1000),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.loadPackagePreview());

  /**
   * Debounced version for manual input of absolute resource's location
   * **/
  private subscriptionSyncPackageLibrariesLocationDebounced = toObservable(this.packageLibrariesLocation)
    .pipe(
      filter((value) => !!value && !this._resourceInputUtils.isResourceValue(value)),
      debounceTime(1000),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.loadPackagePreview());

  protected criteria = this.createTokenSelectionCriteria();

  protected showRoutingOptions = false;
  protected showCustomAttributes = true;
  protected isFunctionPackageReady = false;
  protected showPreview = true;
  protected isLoading = false;
  protected previewError?: string;
  protected addedFunctions?: Keyword[];

  protected save(): void {
    if (!this._data?.functionPackage && (!this.functionPackage.packageLocation || !this.isFunctionPackageReady)) {
      return;
    }

    const customForm = this.customForm();
    const isReady$ = !customForm ? of(undefined) : customForm.readyToProceed();

    isReady$
      .pipe(
        map(() => this.functionPackage),
        tap(() => {
          this.isFunctionPackageReady = false;
          this.isLoading = true;
        }),
        switchMap((functionPackage) => this._api.saveFunctionPackage(functionPackage)),
        catchError(() => {
          this._resourceInputBridgeService.deleteUploadedResource();
          return of(false);
        }),
        tap(() => (this.isLoading = false)),
      )
      .subscribe((result) => this._matDialogRef.close({ isSuccess: !!result }));
  }

  protected cancel(): void {
    this._resourceInputBridgeService.deleteUploadedResource();
    this._matDialogRef.close();
  }

  protected addRoutingCriteria(): void {
    this.criteria.push({ key: '', value: '' });
  }

  protected saveRoutingCriteria(): void {
    this.functionPackage.tokenSelectionCriteria = this.criteria
      .filter((item) => !!item.key)
      .reduce(
        (res, item) => {
          res[item.key] = item.value;
          return res;
        },
        {} as Record<string, string>,
      );
  }

  protected removeRoutingCriteria(criterion: KeyValue<string, string>): void {
    if (this.functionPackage.tokenSelectionCriteria) {
      delete this.functionPackage.tokenSelectionCriteria[criterion.key];
    }
    this.criteria = this.criteria.filter((item) => item !== criterion);
  }

  protected saveCustomAttributes(customAttributes?: Record<string, unknown>): void {
    this.customAttributes = customAttributes as FunctionPackageConfigurationDialogComponent['customAttributes'];
    this.functionPackage.packageAttributes = this.customAttributes.attributes;
  }

  protected handlePackageLocationChange(packageLocation?: string): void {
    this.functionPackage.packageLocation = packageLocation;
    this.loadPackagePreview();
  }

  protected handlePackageLibrariesLocationChange(packageLibrariesLocation?: string): void {
    this.functionPackage.packageLibrariesLocation = packageLibrariesLocation;
    this.loadPackagePreview();
  }

  private loadPackagePreview(): void {
    of(undefined)
      .pipe(
        tap(() => {
          this.isLoading = true;
          this.isFunctionPackageReady = false;
          this.previewError = undefined;
          this.addedFunctions = undefined;
        }),
        switchMap(() =>
          iif(
            () => !this.functionPackage?.packageLocation,
            of(undefined),
            this._api.packagePreview(this.functionPackage).pipe(
              map((response) => {
                const addedFunctions = response.functions;
                const previewError = response.loadingError;
                return { addedFunctions, previewError };
              }),
              catchError((error) =>
                of({
                  previewError: error.data,
                  addedFunctions: undefined,
                }),
              ),
            ),
          ),
        ),
        tap(() => (this.isLoading = false)),
      )
      .subscribe((result) => {
        this.addedFunctions = result?.addedFunctions;
        this.previewError = result?.previewError;
        if (this.previewError) {
          return;
        }
        if (this.addedFunctions?.length) {
          this.isFunctionPackageReady = true;
        } else {
          this.previewError = `No keyword were found!`;
        }
      });
  }

  private createTokenSelectionCriteria(): KeyValue<string, string>[] {
    return Object.entries(this.functionPackage?.tokenSelectionCriteria || {}).map(
      ([key, value]) => ({ key, value }) as KeyValue<string, string>,
    );
  }
}
