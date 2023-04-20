import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { Input as StInput, ScreensService } from '../../client/generated';
import { AJS_MODULE, setObjectFieldValue } from '../../shared';

@Component({
  selector: 'step-custom-forms',
  templateUrl: './custom-form.component.html',
  styleUrls: ['./custom-form.component.scss'],
})
export class CustomFormComponent implements OnInit {
  @Input() stEditableLabelMode = false;
  @Input() stScreen!: string;
  @Input() stModel!: Record<string, unknown>;
  @Input() stDisabled: boolean = false;
  @HostBinding('class.inline') @Input() stInline: boolean = false;
  @Input() stExcludeFields: string[] = [];

  @Output() stModelChange = new EventEmitter<Record<string, unknown>>();

  inputs: StInput[] = [];

  constructor(private _screensService: ScreensService) {}

  ngOnInit(): void {
    this._screensService.getInputsForScreenPost(this.stScreen, this.stModel).subscribe((inputs) => {
      this.inputs = inputs.filter((input) => !this.stExcludeFields.includes(input.id!));
    });
  }

  onInputValueChange(input: StInput, value: string): void {
    setObjectFieldValue(this.stModel, input.id!, value);
    this.stModelChange.emit({
      ...this.stModel,
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepCustomForms', downgradeComponent({ component: CustomFormComponent }));
