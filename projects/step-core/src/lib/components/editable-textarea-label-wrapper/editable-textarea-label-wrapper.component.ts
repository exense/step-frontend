import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../shared';

@Component({
  selector: 'step-editable-textarea-label-wrapper',
  templateUrl: './editable-textarea-label-wrapper.component.html',
  styleUrls: ['./editable-textarea-label-wrapper.component.scss'],
})
export class EditableTextareaLabelWrapperComponent {
  @Input() label?: string = '';
  @Input() isDisabled: boolean = false;
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
}
getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepEditableTextareaLabel', downgradeComponent({ component: EditableTextareaLabelWrapperComponent }));
