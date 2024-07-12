import { Component, EventEmitter, HostBinding, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AugmentedScreenService, Input as StInput } from '../../../../client/step-client-module';
import { ObjectUtilsService, ScreenDataMetaService } from '../../../basics/step-basics.module';
import { StandardCustomFormInputComponent } from '../custom-form-input/standard-custom-form-input.component';
import { DynamicLabelCustomFormInputComponent } from '../custom-form-input/dynamic-label-custom-form-input.component';
import { CustomFormInputModelPipe } from '../../pipes/custom-form-input-model.pipe';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, debounceTime, filter, map, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

  @HostBinding('class.editable-label-mode') @Input() stEditableLabelMode = false;
  @Input() stScreen!: string;
  @Input() stModel!: Record<string, unknown>;
  @Input() stDisabled: boolean = false;
  @HostBinding('class.inline') @Input() stInline: boolean = false;
  @Input() stExcludeFields: string[] = [];
  @Input() required: boolean = false;

  @Output() stModelChange = new EventEmitter<Record<string, unknown>>();
  @Output() customInputTouch = new EventEmitter<void>();

  inputs: StInput[] = [];

  ngOnInit(): void {
    this._screenDataMeta.checkMetaInformationAboutScreenInRoute(this.stScreen, this._activatedRoute);
    this.valueChange$
      .pipe(
        debounceTime(500),
        tap((valueChange) => {
          if (!valueChange) {
            return;
          }
          this._objectUtils.setObjectFieldValue(this.stModel, valueChange.inputId, valueChange.value);
          this.stModelChange.emit({
            ...this.stModel,
          });
        }),
        switchMap(() => this._screensService.getInputsForScreenPost(this.stScreen, this.stModel)),
        map((screenInputs) => screenInputs.filter((input) => !!input && !this.stExcludeFields.includes(input.id!))),
        filter((updatedInputs) => JSON.stringify(this.inputs) !== JSON.stringify(updatedInputs)),
      )
      .subscribe((inputs) => (this.inputs = inputs));
  }

  ngOnDestroy(): void {
    this.valueChange$.complete();
  }

  protected onInputValueChange(input: StInput, value: string): void {
    const inputId = input.id!;
    this.valueChange$.next({ inputId, value });
  }

  protected onCustomInputTouched(): void {
    this.customInputTouch.emit();
  }
}
