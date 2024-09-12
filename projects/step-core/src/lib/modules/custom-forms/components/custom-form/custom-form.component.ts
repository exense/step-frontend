import {
  Component,
  computed,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { AugmentedScreenService, Input as StInput } from '../../../../client/step-client-module';
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
  map,
  merge,
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
  standalone: true,
  imports: [
    CUSTOM_FORMS_COMMON_IMPORTS,
    StandardCustomFormInputComponent,
    DynamicLabelCustomFormInputComponent,
    CustomFormInputModelPipe,
  ],
})
export class CustomFormComponent implements OnInit, OnDestroy {
  private _screensService = inject(AugmentedScreenService);
  private _activatedRoute = inject(ActivatedRoute);
  private _screenDataMeta = inject(ScreenDataMetaService);
  private _objectUtils = inject(ObjectUtilsService);

  private valueChange$ = new BehaviorSubject<{ inputId: string; value: string } | undefined>(undefined);
  private valueChangeDebounced$ = this.valueChange$.pipe(debounceTime(500));

  private changeStart$ = this.valueChange$.pipe(map(() => true));
  private changeEnd$ = this.valueChangeDebounced$.pipe(map(() => false));

  readonly changeInProgress$ = merge(this.changeStart$, this.changeEnd$).pipe(distinctUntilChanged());
  readonly changeInProgress = toSignal(this.changeInProgress$, { initialValue: false });

  @HostBinding('class.editable-label-mode') @Input() stEditableLabelMode = false;
  @Input() stScreen!: string;
  @Input() stModel!: Record<string, unknown>;
  @Input() stDisabled: boolean = false;
  @HostBinding('class.inline') @Input() stInline: boolean = false;
  @Input() stExcludeFields: string[] = [];
  @Input() required: boolean = false;

  @Output() stModelChange = new EventEmitter<Record<string, unknown>>();
  @Output() customInputTouch = new EventEmitter<void>();

  private activeExpressionInputsKeys = new Set<string>();
  private orderedIds = signal<string[]>([]);
  private originalInputs = signal<Record<string, StInput>>({});
  private visibilityFlags = signal<Record<string, boolean> | undefined>(undefined);
  private visibilityFlagsJson = computed(() => JSON.stringify(this.visibilityFlags()));

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
    this._screenDataMeta.checkMetaInformationAboutScreenInRoute(this.stScreen, this._activatedRoute);
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

  private determineCustomFormInputSchema(stInputs: StInput[]): CustomFormInputsSchema {
    return stInputs.reduce(
      (res, input) => {
        res.ids.push(input.id!);
        if (input.activationExpression) {
          res.activeExpressionInputsKeys.add(input.id!);
        }

        if (input.options) {
          input.options.forEach((opt) => {
            if (opt.activationExpression) {
              res.activeExpressionInputsKeys.add(`${input.id!}.${opt.value}`);
            }
          });
        }
        res.inputs[input.id!] = input;
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
    stInputs: StInput[],
  ): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    activeExpressionInputsKeys.forEach((key) => (result[key] = false));
    return stInputs.reduce((res, input) => {
      if (res[input.id!] !== undefined) {
        res[input.id!] = true;
      }
      input.options?.forEach((option) => {
        const optionKey = `${input.id!}.${option.value}`;
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
      .getScreenInputsByScreenIdWithCache(this.stScreen)
      .pipe(
        map((screenInputs) => screenInputs.map((sInput) => sInput.input!)),
        map((screenInputs) => screenInputs.filter((input) => !!input && !this.stExcludeFields.includes(input.id!))),
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
      this._objectUtils.setObjectFieldValue(this.stModel, valueChange!.inputId, valueChange!.value);
      this.stModelChange.emit({
        ...this.stModel,
      });
    });
  }

  private setupVisibilityUpdate(): void {
    this.valueChangeDebounced$
      .pipe(
        tap((valueChange) => {
          if (!valueChange) {
            return;
          }
          this._objectUtils.setObjectFieldValue(this.stModel, valueChange!.inputId, valueChange!.value);
          this.stModelChange.emit({
            ...this.stModel,
          });
        }),
        switchMap(() => this._screensService.getInputsForScreenPost(this.stScreen, this.stModel)),
        map((screenInputs) => screenInputs.filter((input) => !!input && !this.stExcludeFields.includes(input.id!))),
        map((screenInputs) =>
          this.determineCustomFormInputVisibilityFlags(this.activeExpressionInputsKeys, screenInputs),
        ),
        filter((visibilityFlags) => JSON.stringify(visibilityFlags) !== this.visibilityFlagsJson()),
      )
      .subscribe((visibilityFlags) => this.visibilityFlags.set(visibilityFlags));
  }

  private setDefaultValues(inputs: StInput[]): void {
    let valueHasBeenChanged = false;
    inputs
      .filter((input) => this._objectUtils.getObjectFieldValue(this.stModel, input.id!) === undefined)
      .forEach((input) => {
        const defaultValue = input.type === 'CHECKBOX' ? input.defaultValue ?? false : input.defaultValue;
        if (defaultValue !== null && defaultValue !== undefined && defaultValue !== '') {
          this._objectUtils.setObjectFieldValue(this.stModel, input.id!, defaultValue);
          valueHasBeenChanged = true;
        }
      });
    if (valueHasBeenChanged) {
      this.stModelChange.emit(this.stModel);
    }
  }
}
