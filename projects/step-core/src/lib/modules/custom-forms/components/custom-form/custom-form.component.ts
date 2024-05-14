import { Component, EventEmitter, HostBinding, inject, Input, OnInit, Output } from '@angular/core';
import { AugmentedScreenService, Input as StInput } from '../../../../client/step-client-module';
import { ObjectUtilsService, ScreenDataMetaService } from '../../../basics/step-basics.module';
import { StandardCustomFormInputComponent } from '../custom-form-input/standard-custom-form-input.component';
import { DynamicLabelCustomFormInputComponent } from '../custom-form-input/dynamic-label-custom-form-input.component';
import { CustomFormInputModelPipe } from '../../pipes/custom-form-input-model.pipe';
import { CUSTOM_FORMS_COMMON_IMPORTS } from '../../types/custom-from-common-imports.contant';
import { ActivatedRoute } from '@angular/router';

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
export class CustomFormComponent implements OnInit {
  private _screensService = inject(AugmentedScreenService);
  private _activatedRoute = inject(ActivatedRoute);
  private _screenDataMeta = inject(ScreenDataMetaService);
  private _objectUtils = inject(ObjectUtilsService);

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
    this.updateInputs();
  }

  protected updateInputs() {
    this._screensService.getInputsForScreenPost(this.stScreen, this.stModel).subscribe((inputs) => {
      const updatedInputs = inputs.filter((input) => !this.stExcludeFields.includes(input.id!));
      if (JSON.stringify(this.inputs) !== JSON.stringify(updatedInputs)) {
        this.inputs = updatedInputs;
      }
    });
  }

  protected onInputValueChange(input: StInput, value: string): void {
    this._objectUtils.setObjectFieldValue(this.stModel, input.id!, value);
    this.stModelChange.emit({
      ...this.stModel,
    });
    this.updateInputs();
  }

  protected onCustomInputTouched(): void {
    this.customInputTouch.emit();
  }
}
