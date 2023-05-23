import { KeyValue } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AJS_LOCATION,
  AlertType,
  AugmentedKeywordsService,
  AuthService,
  DialogsService,
  Function as Keyword,
  functionConfigurationDialogFormCreate,
  functionConfigurationDialogFormSetValueToForm,
  functionConfigurationDialogFormSetValueToModel,
  FunctionType,
  FunctionTypeRegistryService,
} from '@exense/step-core';
import { ILocationService } from 'angular';
import { of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { FunctionConfigurationDialogData } from '../../types/function-configuration-dialog-data.interface';

@Component({
  selector: 'step-function-configuration-dialog',
  templateUrl: './function-configuration-dialog.component.html',
  styleUrls: ['./function-configuration-dialog.component.scss'],
})
export class FunctionConfigurationDialogComponent implements OnInit, OnDestroy {
  private _functionConfigurationDialogData = inject<FunctionConfigurationDialogData>(MAT_DIALOG_DATA);
  private _augmentedKeywordsService = inject(AugmentedKeywordsService);
  private _matDialogRef = inject<MatDialogRef<FunctionConfigurationDialogComponent, Keyword>>(MatDialogRef);
  private _ajsLocation = inject<ILocationService>(AJS_LOCATION);
  private _dialogsService = inject(DialogsService);
  private _functionTypeRegistryService = inject(FunctionTypeRegistryService);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  private readonly terminator$ = new Subject<void>();
  private readonly setValueToFormInternal$ = new Subject<void>();
  private readonly setValueToModelInternal$ = new Subject<void>();

  protected readonly lightForm = this._functionConfigurationDialogData.dialogConfig.lightForm;
  protected readonly schemaEnforced = this._authService.getConf()?.miscParams?.['enforceschemas'] === 'true';
  protected readonly formGroup = functionConfigurationDialogFormCreate(
    this._formBuilder,
    this.lightForm,
    this.schemaEnforced
  );
  protected readonly functionTypeItemInfos = this._functionTypeRegistryService.getItemInfos();
  protected readonly setValueToForm$ = this.setValueToFormInternal$.asObservable();
  protected readonly setValueToModel$ = this.setValueToModelInternal$.asObservable();
  protected readonly AlertType = AlertType;
  protected readonly FunctionType = FunctionType;

  protected keyword?: Keyword;
  protected schemaJSON?: string;

  protected modalTitle: string = !this._functionConfigurationDialogData.keyword ? 'New Keyword' : 'Edit Keyword';
  protected isLoading: boolean = false;
  protected tokenSelectionCriteria: KeyValue<string, string>[] = [];

  ngOnInit(): void {
    this.initStepFunction();

    this.formGroup.statusChanges.pipe(takeUntil(this.terminator$)).subscribe(() => {
      this._changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
    this.setValueToFormInternal$.complete();
    this.setValueToModelInternal$.complete();
  }

  protected get functionType(): string {
    return this.formGroup.controls.type.value;
  }

  protected get customScreenTable(): string {
    return this._functionConfigurationDialogData.dialogConfig.customScreenTable;
  }

  protected get executeLocally(): boolean {
    return this.formGroup.controls.executeLocally.value;
  }

  private get serviceRoot(): string {
    return this._functionConfigurationDialogData.dialogConfig.serviceRoot;
  }

  protected onFunctionTypeRenderComplete(): void {
    this.setValueToFormInternal$.next();
    this.formGroup.updateValueAndValidity();
  }

  protected save(edit?: boolean): void {
    functionConfigurationDialogFormSetValueToModel(this.formGroup, this.keyword!);

    this.setValueToModelInternal$.next();

    this._augmentedKeywordsService
      .saveFunction(this.keyword!, this.serviceRoot)
      .pipe(
        switchMap((keyword) => {
          this._matDialogRef.close(keyword);

          if (!edit) {
            return of();
          }

          return this._augmentedKeywordsService.getFunctionEditor(keyword.id!);
        }),
        tap((path) => {
          if (path) {
            this._ajsLocation.path(path);
          } else {
            this._dialogsService.showErrorMsg('No editor configured for this function type');
          }
        })
      )
      .subscribe();
  }

  private initStepFunction(): void {
    if (!this._functionConfigurationDialogData.keyword) {
      const { functionTypeFilters } = this._functionConfigurationDialogData.dialogConfig;
      const [type] = functionTypeFilters.length ? functionTypeFilters : [FunctionType.SCRIPT];

      this.keyword = {
        type,
      };
      this.fetchStepFunction(this.keyword.type);
    } else {
      this.keyword = this._functionConfigurationDialogData.keyword;

      functionConfigurationDialogFormSetValueToForm(this.formGroup, this.keyword);
    }
  }

  private fetchStepFunction(stepFunctionType: string): void {
    this._augmentedKeywordsService
      .newFunctionTypeConf(stepFunctionType, this.serviceRoot)
      .pipe(
        tap((keyword) => {
          if (!this.keyword) {
            return;
          }

          keyword.id = this.keyword.id;

          if (this.keyword.attributes) {
            keyword.attributes = this.keyword.attributes;
          }

          if (this.keyword.schema) {
            keyword.schema = this.keyword.schema;
          }
        })
      )
      .subscribe((keyword) => {
        this.keyword = keyword;

        functionConfigurationDialogFormSetValueToForm(this.formGroup, keyword);
      });
  }
}
