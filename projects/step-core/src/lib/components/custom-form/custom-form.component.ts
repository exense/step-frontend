import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { Input as StInput, ScreensService } from '../../client/generated';
import { AJS_MODULE, setObjectFieldValue } from '../../shared';

@Component({
  selector: 'step-custom-forms',
  templateUrl: './custom-form.component.html',
  styleUrls: ['./custom-form.component.scss'],
})
export class CustomFormComponent implements OnInit {
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

  constructor(private _screensService: ScreensService) {}

  ngOnInit(): void {
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
    setObjectFieldValue(this.stModel, input.id!, value);
    this.stModelChange.emit({
      ...this.stModel,
    });
    this.updateInputs();
  }

  protected onCustomInputTouched(): void {
    this.customInputTouch.emit();
  }
}
