import { KeyValue } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AlertType,
  AuthService,
  DialogsService,
  FunctionConfigurationDialogData,
  FunctionConfigurationDialogForm,
  functionConfigurationDialogFormCreate,
  functionConfigurationDialogFormSetValueToForm,
  functionConfigurationDialogFormSetValueToModel,
  FunctionType,
  FunctionTypeRegistryService,
  Keyword,
  FunctionConfigurationApiService,
  FunctionTypeParentFormService,
  FunctionTypeComponent,
  FunctionTypeFormComponent,
  DialogRouteResult,
  ItemInfo,
} from '@exense/step-core';
import { map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-function-configuration-dialog',
  templateUrl: './function-configuration-dialog.component.html',
  styleUrls: ['./function-configuration-dialog.component.scss'],
  providers: [
    {
      provide: FunctionTypeParentFormService,
      useExisting: forwardRef(() => FunctionConfigurationDialogComponent),
    },
  ],
})
export class FunctionConfigurationDialogComponent implements OnInit, AfterContentInit, FunctionTypeParentFormService {
  private _functionConfigurationDialogData = inject<FunctionConfigurationDialogData>(MAT_DIALOG_DATA);
  private _api = inject(FunctionConfigurationApiService);
  private _matDialogRef = inject<MatDialogRef<FunctionConfigurationDialogComponent, DialogRouteResult>>(MatDialogRef);
  private _router = inject(Router);
  private _dialogsService = inject(DialogsService);
  private _functionTypeRegistryService = inject(FunctionTypeRegistryService);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  protected readonly lightForm = this._functionConfigurationDialogData.dialogConfig.lightForm;
  protected readonly schemaEnforced = this._authService.getConf()?.miscParams?.['enforceschemas'] === 'true';
  protected readonly AlertType = AlertType;
  protected readonly schemaErrorsDictionary: Record<string, string> = {
    format: 'The schema must be in a JSON format',
    required: 'This field is required',
  };

  keyword?: Keyword;
  formGroup?: FunctionConfigurationDialogForm;

  protected functionTypeItemInfos = this._functionTypeRegistryService.getItemInfos();
  protected modalTitle: string = !this._functionConfigurationDialogData.keyword ? 'New Keyword' : 'Edit Keyword';
  protected isLoading: boolean = false;
  protected tokenSelectionCriteria: KeyValue<string, string>[] = [];

  @ViewChild('functionTypeComponent', { static: true })
  private functionTypeChild!: FunctionTypeComponent;

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: ItemInfo[] = [];

  ngOnInit(): void {
    this.formGroup = functionConfigurationDialogFormCreate(
      this._formBuilder,
      this.lightForm,
      this.schemaEnforced,
      this._functionConfigurationDialogData,
    );

    this.formGroup.statusChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._changeDetectorRef.detectChanges();
    });

    const { functionTypeFilters } = this._functionConfigurationDialogData.dialogConfig;

    if (functionTypeFilters?.length) {
      this.functionTypeItemInfos = this.functionTypeItemInfos.filter((functionTypeItemInfo) =>
        this._functionConfigurationDialogData.dialogConfig.functionTypeFilters.includes(functionTypeItemInfo.type),
      );
    }

    this.initStepFunction();
  }

  ngAfterContentInit(): void {
    this.dropdownItemsFiltered = [...this.functionTypeItemInfos];
    this.filterMultiControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      if (value) {
        this.dropdownItemsFiltered = this.functionTypeItemInfos.filter((item) =>
          item.label.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        this.dropdownItemsFiltered = [...this.functionTypeItemInfos];
      }
    });
  }

  protected get functionType(): string {
    return this.formGroup!.controls.type.value;
  }

  protected get customScreenTable(): string {
    return this._functionConfigurationDialogData.dialogConfig.customScreenTable;
  }

  protected get executeLocally(): boolean {
    return this.formGroup!.controls.executeLocally.value;
  }

  protected save(edit?: boolean): void {
    if (this.formGroup!.invalid) {
      this.formGroup!.markAllAsTouched();
      return;
    }
    functionConfigurationDialogFormSetValueToModel(this.formGroup!, this.keyword!);

    (this.functionTypeChild.componentInstance as FunctionTypeFormComponent<any>).setValueToModel();

    this._api
      .saveFunction(this.keyword!)
      .pipe(
        switchMap((keyword) => {
          const isSuccess = !!keyword;

          if (!edit) {
            return of({ isSuccess, path: undefined });
          }

          return this._api.getFunctionEditor(keyword.id!).pipe(map((path) => ({ isSuccess, path })));
        }),
      )
      .subscribe(({ isSuccess, path }) => {
        if (!edit) {
          this._matDialogRef.close({ isSuccess });
          return;
        }

        if (path) {
          this._router.navigateByUrl(path);
        } else {
          this._dialogsService.showErrorMsg('No editor configured for this function type').subscribe();
        }
        this._matDialogRef.close({ isSuccess, canNavigateBack: !path });
      });
  }

  private determineDefaultType(): string {
    const allowedTypes = this.functionTypeItemInfos.map((item) => item.type);
    const defaultTypeCandidate =
      this._functionConfigurationDialogData?.dialogConfig?.functionTypeFilters?.[0] ?? FunctionType.SCRIPT;
    return allowedTypes.includes(defaultTypeCandidate) ? defaultTypeCandidate : allowedTypes[0];
  }

  private initStepFunction(): void {
    if (!this._functionConfigurationDialogData.keyword) {
      this.keyword = {
        type: this.determineDefaultType(),
      };
      this.fetchStepFunction(this.keyword.type);
    } else {
      this.keyword = this._functionConfigurationDialogData.keyword;

      functionConfigurationDialogFormSetValueToForm(this.formGroup!, this.keyword, this._formBuilder);
    }
  }

  @HostListener('keydown.enter')
  private saveByEnter(): void {
    this.save(false);
  }

  protected fetchStepFunction(stepFunctionType: string): void {
    this._api
      .newFunctionTypeConf(stepFunctionType)
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
        }),
      )
      .subscribe((keyword) => {
        this.keyword = keyword;

        functionConfigurationDialogFormSetValueToForm(this.formGroup!, keyword, this._formBuilder);
      });
  }
}
