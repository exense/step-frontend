import { Component, HostBinding, inject, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FunctionPackageConfigurationDialogData } from '../../types/function-package-configuration-dialog-data.interface';
import {
  AlertType,
  AugmentedKeywordPackagesService,
  DialogRouteResult,
  Keyword,
  ResourceInputBridgeService,
  CustomFormComponent,
} from '@exense/step-core';
import { catchError, iif, map, of, switchMap, tap } from 'rxjs';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-function-package-configuration-dialog',
  templateUrl: './function-package-configuration-dialog.component.html',
  styleUrls: ['./function-package-configuration-dialog.component.scss'],
})
export class FunctionPackageConfigurationDialogComponent {
  readonly AlertType = AlertType;

  private _api = inject(AugmentedKeywordPackagesService);
  private _matDialogRef = inject<MatDialogRef<FunctionPackageConfigurationDialogData, DialogRouteResult>>(MatDialogRef);
  protected _data = inject<FunctionPackageConfigurationDialogData>(MAT_DIALOG_DATA, { optional: true });
  private _resourceInputBridgeService = inject(ResourceInputBridgeService);

  private customForm = viewChild('customAttributesForm', { read: CustomFormComponent });

  readonly modalTitle = `${this._data?.functionPackage ? 'Edit' : 'New'} Keyword Package`;

  protected functionPackage = this._data?.functionPackage ?? { packageAttributes: {} };
  protected customAttributes = { attributes: this.functionPackage.packageAttributes };

  protected criteria = this.createTokenSelectionCriteria();

  protected showRoutingOptions = false;
  protected showCustomAttributes = true;
  protected isFunctionPackageReady = false;
  protected showPreview = true;
  protected isLoading = false;
  protected previewError?: string;
  protected addedFunctions?: Keyword[];

  @HostBinding('keydown.enter')
  save(): void {
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

  cancel(): void {
    this._resourceInputBridgeService.deleteUploadedResource();
    this._matDialogRef.close();
  }

  addRoutingCriteria(): void {
    this.criteria.push({ key: '', value: '' });
  }

  saveRoutingCriteria(): void {
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

  removeRoutingCriteria(criterion: KeyValue<string, string>): void {
    if (this.functionPackage.tokenSelectionCriteria) {
      delete this.functionPackage.tokenSelectionCriteria[criterion.key];
    }
    this.criteria = this.criteria.filter((item) => item !== criterion);
  }

  saveCustomAttributes(customAttributes?: Record<string, unknown>): void {
    this.customAttributes = customAttributes as FunctionPackageConfigurationDialogComponent['customAttributes'];
    this.functionPackage.packageAttributes = this.customAttributes.attributes;
  }

  handlePackageLocationChange(packageLocation?: string): void {
    this.functionPackage.packageLocation = packageLocation;
    this.loadPackagePreview();
  }

  handlePackageLibrariesLocationChange(packageLibrariesLocation?: string): void {
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
