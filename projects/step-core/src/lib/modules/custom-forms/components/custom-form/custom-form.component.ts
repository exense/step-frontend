import { Component, computed, inject, input, linkedSignal, OnDestroy, OnInit, output, signal } from '@angular/core';
import { AugmentedScreenService, Input as StInput, ScreenInput } from '../../../../client/step-client-module';
import { ObjectUtilsService, ScreenDataMetaService } from '../../../basics/step-basics.module';
import { StandardCustomFormInputComponent } from '../custom-form-input/standard-custom-form-input.component';
import { DynamicLabelCustomFormInputComponent } from '../custom-form-input/dynamic-label-custom-form-input.component';
import { CustomFormInputModelPipe } from '../../pipes/custom-form-input-model.pipe';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  groupBy,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  take,
  tap,
} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface CustomFormInputsSchema {
  ids: string[];
  inputs: Record<string, StInput>;
  activeExpressionInputsKeys: Set<string>;
}

@Component({
  selector: 'step-custom-forms',
  templateUrl: './custom-form.component.html',
  styleUrls: ['./custom-form.component.scss'],
  imports: [
    CUSTOM_FORMS_COMMON_IMPORTS,
    StandardCustomFormInputComponent,
    DynamicLabelCustomFormInputComponent,
    CustomFormInputModelPipe,
  ],
  host: {
    '[class.editable-label-mode]': 'stEditableLabelMode()',
    '[class.inline]': `stInline()`,
  },
})
export class CustomFormComponent implements OnInit, OnDestroy {
  private _screensService = inject(AugmentedScreenService);
  private _activatedRoute = inject(ActivatedRoute);
  private _screenDataMeta = inject(ScreenDataMetaService);
  private _objectUtils = inject(ObjectUtilsService);

  private valueChange$ = new BehaviorSubject<{ inputId: string; value: string } | undefined>(undefined);
  private valueChangeDebounced$ = this.valueChange$.pipe(
    groupBy((value) => value?.inputId),
    mergeMap((group) => group.pipe(debounceTime(500))),
  );

  private changeStart$ = this.valueChange$.pipe(map(() => true));
  private changeEnd$ = this.valueChangeDebounced$.pipe(map(() => false));

  readonly changeInProgress$ = merge(this.changeStart$, this.changeEnd$).pipe(distinctUntilChanged());
  readonly changeInProgress = toSignal(this.changeInProgress$, { initialValue: false });

  readonly stEditableLabelMode = input(false);
  readonly stInline = input(false);
  readonly stDisabled = input(false);
  readonly required = input(false);
  readonly stScreen = input.required<string>();
  readonly stModel = input.required<Record<string, unknown>>();
  readonly stExcludeFields = input<string[]>([]);
  readonly stIncludeFieldsOnly = input<string[] | undefined>();

  readonly stModelChange = output<Record<string, unknown | string>>();
  readonly customInputTouch = output<void>();

  private activeExpressionInputsKeys = new Set<string>();
  private orderedIds = signal<string[]>([]);
  private originalInputs = signal<Record<string, StInput>>({});
  private visibilityFlags = signal<Record<string, boolean> | undefined>(undefined);
  private visibilityFlagsJson = computed(() => JSON.stringify(this.visibilityFlags()));

  private internalModel = linkedSignal(() => this.stModel());

  readonly inputs = computed(() => {
    const orderedIds = this.orderedIds();
    const originalInputs = this.originalInputs();
    const visibilityFlags = this.visibilityFlags();
    if (!visibilityFlags) {
      return [];
    }

    return orderedIds.reduce((res, id) => {
      if (visibilityFlags[id] === false) {
        return res;
      }
      const item = { ...originalInputs[id] } as StInput;
      if (item.options) {
        item.options = item.options.filter((option) => {
          const optionKey = `${id}.${option.value}`;
          return visibilityFlags[optionKey] !== false;
        });
      }
      res.push(item);
      return res;
    }, [] as StInput[]);
  });

  ngOnInit(): void {
    this._screenDataMeta.checkMetaInformationAboutScreenInRoute(this.stScreen(), this._activatedRoute);
    this.initializeFields();
  }

  ngOnDestroy(): void {
    this.valueChange$.complete();
  }

  readyToProceed(): Observable<void> {
    if (!this.changeInProgress()) {
      return of(undefined);
    }
    return this.changeInProgress$.pipe(
      filter((inProgress) => !inProgress),
      take(1),
      map(() => undefined),
    );
  }

  protected onInputValueChange(input: StInput, value: string): void {
    const inputId = input.id!;
    this.valueChange$.next({ inputId, value });
  }

  protected onCustomInputTouched(): void {
    this.customInputTouch.emit();
  }

  private determineCustomFormInputSchema(screenInputs: ScreenInput[]): CustomFormInputsSchema {
    return screenInputs.reduce(
      (res, item) => {
        res.ids.push(item.id!);
        if (item?.input?.activationExpression) {
          res.activeExpressionInputsKeys.add(item.id!);
        }

        if (item?.input?.options) {
          item.input.options.forEach((opt) => {
            if (opt.activationExpression) {
              res.activeExpressionInputsKeys.add(`${item.id!}.${opt.value}`);
            }
          });
        }
        res.inputs[item.id!] = item.input!;
        return res;
      },
      {
        ids: [],
        inputs: {},
        activeExpressionInputsKeys: new Set<string>(),
      } as CustomFormInputsSchema,
    );
  }

  private determineCustomFormInputVisibilityFlags(
    activeExpressionInputsKeys: Set<string>,
    screenInputs: ScreenInput[],
  ): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    activeExpressionInputsKeys.forEach((key) => (result[key] = false));
    return screenInputs.reduce((res, item) => {
      if (res[item.id!] !== undefined) {
        res[item.id!] = true;
      }
      item?.input?.options?.forEach((option) => {
        const optionKey = `${item.id!}.${option.value}`;
        if (res[optionKey] === undefined) {
          return;
        }
        res[optionKey] = true;
      });
      return res;
    }, result);
  }

  private initializeFields(): void {
    this._screensService
      .getScreenInputsByScreenIdWithCache(this.stScreen())
      .pipe(
        map((screenInputs) => this.filterScreenInputs(screenInputs)),
        tap((screenInputs) => this.setDefaultValues(screenInputs)),
        map((screenInputs) => this.determineCustomFormInputSchema(screenInputs)),
      )
      .subscribe((schema) => {
        this.orderedIds.set(schema.ids);
        this.originalInputs.set(schema.inputs);
        this.activeExpressionInputsKeys = schema.activeExpressionInputsKeys;
        if (!this.activeExpressionInputsKeys.size) {
          this.visibilityFlags.set({});
          this.setupValueChange();
          return;
        }
        const visibilityFlags: Record<string, boolean> = {};
        this.activeExpressionInputsKeys.forEach((key) => (visibilityFlags[key] = false));
        this.visibilityFlags.set(visibilityFlags);
        this.setupVisibilityUpdate();
      });
  }

  private setupValueChange(): void {
    this.valueChangeDebounced$.pipe(filter((valueChange) => !!valueChange)).subscribe((valueChange) => {
      const changedModel = this._objectUtils.setObjectFieldValue(
        this.internalModel(),
        valueChange!.inputId,
        valueChange!.value,
      );
      this.internalModel.set(changedModel);
      this.stModelChange.emit(changedModel);
    });
  }

  private setupVisibilityUpdate(): void {
    this.valueChangeDebounced$
      .pipe(
        map((valueChange) => {
          if (!valueChange) {
            return undefined;
          }
          const changedModel = this._objectUtils.setObjectFieldValue(
            this.internalModel(),
            valueChange!.inputId,
            valueChange!.value,
          );
          this.internalModel.set(changedModel);
          this.stModelChange.emit(changedModel);
          return changedModel;
        }),
        switchMap((changedModel) =>
          this._screensService.getScreenInputsForScreenPost(this.stScreen(), changedModel ?? this.internalModel()),
        ),
        map((screenInputs) => this.filterScreenInputs(screenInputs)),
        map((screenInputs) =>
          this.determineCustomFormInputVisibilityFlags(this.activeExpressionInputsKeys, screenInputs),
        ),
        filter((visibilityFlags) => JSON.stringify(visibilityFlags) !== this.visibilityFlagsJson()),
      )
      .subscribe((visibilityFlags) => this.visibilityFlags.set(visibilityFlags));
  }

  private setDefaultValues(screenInputs: ScreenInput[]): void {
    const inputs = screenInputs
      .map((item) => item.input as StInput)
      .filter(
        (input) => !!input && this._objectUtils.getObjectFieldValue(this.internalModel(), input.id!) === undefined,
      );

    let valueHasBeenChanged = false;
    let model = this.internalModel();
    for (let item of inputs) {
      const defaultValue = item.type === 'CHECKBOX' ? item.defaultValue ?? false : item.defaultValue;
      if (defaultValue !== null && defaultValue !== undefined && defaultValue !== '') {
        model = this._objectUtils.setObjectFieldValue(model, item.id!, defaultValue);
        valueHasBeenChanged = true;
      }
    }

    if (valueHasBeenChanged) {
      this.internalModel.set(model);
      this.stModelChange.emit(model);
    }
  }

  private filterScreenInputs(screenInputs: ScreenInput[]): ScreenInput[] {
    const excludeFields = new Set(this.stExcludeFields());
    let result = screenInputs.filter((item) => !!item.input && !excludeFields.has(item.input.id!));
    if (this.stIncludeFieldsOnly()) {
      const includeFields = new Set(this.stIncludeFieldsOnly()!);
      result = result.filter((item) => includeFields.has(item.input!.id!));
    }
    return result;
  }
}
