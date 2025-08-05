import { AfterViewInit, Component, ElementRef, Input, Optional, ViewChild } from '@angular/core';
import { NgControl } from '@angular/forms';
import { JsonRawEditorComponent } from '../json-raw-editor/json-raw-editor.component';

enum InitializeValueState {
  UNKNOWN,
  NEED_TO_BE_INITIALIZED,
  INITIALIZED,
}

@Component({
  selector: 'step-json-raw-editor-formatted',
  templateUrl: './json-raw-editor-formatted.component.html',
  styleUrls: ['./json-raw-editor-formatted.component.scss'],
  standalone: false,
})
export class JsonRawEditorFormattedComponent extends JsonRawEditorComponent implements AfterViewInit {
  private initializeValueState: InitializeValueState = InitializeValueState.UNKNOWN;

  @Input() errorKeysDictionary?: Record<string, string>;
  @Input() showRequiredMarker: boolean = false;

  @ViewChild('preElement', { static: true })
  private preElement?: ElementRef<HTMLPreElement>;

  constructor(@Optional() _ngControl?: NgControl) {
    super(_ngControl);
  }

  ngAfterViewInit(): void {
    if (this.initializeValueState === InitializeValueState.NEED_TO_BE_INITIALIZED) {
      this.initializeValue();
    }
  }

  protected override stringify(value: any): string {
    return JSON.stringify(value, null, 2);
  }

  protected handleInput(element: HTMLPreElement): void {
    this.rawValueFormControl.setValue(element.innerText);
  }

  override writeValue(obj: any) {
    super.writeValue(obj);
    if (this.preElement) {
      this.initializeValue();
    } else {
      this.initializeValueState = InitializeValueState.NEED_TO_BE_INITIALIZED;
    }
  }

  private initializeValue(): void {
    this.preElement!.nativeElement.innerText = this.internalJsonValue ?? '';
    this.initializeValueState = InitializeValueState.INITIALIZED;
  }
}
