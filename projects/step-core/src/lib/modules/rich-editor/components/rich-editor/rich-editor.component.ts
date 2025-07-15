import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  forwardRef,
  input,
  OnDestroy,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as ace from 'ace-builds';
import 'ace-builds/src-min-noconflict/theme-chrome.js';
import 'ace-builds/src-min-noconflict/mode-javascript.js';
import 'ace-builds/src-min-noconflict/mode-groovy.js';
import 'ace-builds/src-min-noconflict/mode-json.js';
import 'ace-builds/src-min-noconflict/mode-xml.js';
import 'ace-builds/src-min-noconflict/mode-java.js';
import 'ace-builds/src-min-noconflict/mode-yaml.js';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import { AceMode } from '../../types/ace-mode.enum';

type OnChange = (value?: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-rich-editor',
  standalone: true,
  imports: [StepBasicsModule],
  templateUrl: './rich-editor.component.html',
  styleUrl: './rich-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditorComponent),
      multi: true,
    },
  ],
  host: {
    '[class.is-disabled]': 'isDisabled()',
  },
})
export class RichEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  readonly syntaxMode = input<AceMode | string>('');
  readonly wrapText = input(false, { transform: (value?: boolean) => !!value });
  readonly rowNumbers = input(true, { transform: (value?: boolean) => !!value });

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private editorElement = viewChild('editor', { read: ElementRef<HTMLDivElement> });
  private editor?: ace.Ace.Editor;

  private initialValue: string = '';

  protected readonly isDisabled = signal(false);

  private handleChanges = () => this.onChange?.(this.editor?.getValue() ?? '');
  private handleBlur = () => this.onTouch?.();

  private effectSyntaxModeChange = effect(() => this.editor?.session?.setMode?.(this.syntaxMode() ?? ''));
  private effectWrapTextChange = effect(() => this.editor?.setOption?.('wrap', this.wrapText()));
  private effectRowNumbersChange = effect(() => {
    const showNumbers = this.rowNumbers();
    this.editor?.setOption?.('showLineNumbers', showNumbers);
    this.editor?.setOption?.('showGutter', showNumbers);
  });

  writeValue(value: string): void {
    if (this.editor) {
      this.editor.setValue(value);
      return;
    }
    this.initialValue = value;
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editor) {
      this.editor.setReadOnly(isDisabled);
    }
    this.isDisabled.set(isDisabled);
  }

  ngAfterViewInit(): void {
    ace.require('ace/ext/language_tools');
    this.editor = ace.edit(this.editorElement()!.nativeElement);
    this.editor.session.setUseWorker(false);
    this.editor.setTheme('ace/theme/chrome');
    this.editor.session.setMode(this.syntaxMode() ?? '');
    if (this.initialValue) {
      this.editor.setValue(this.initialValue);
      this.initialValue = '';
    }
    const isDisabled = this.isDisabled();
    if (isDisabled !== undefined) {
      this.editor.setReadOnly(isDisabled);
      setTimeout(() => this.clearSelection(), 100);
    }
    this.editor.setOption('wrap', this.wrapText());
    const showNumbers = this.rowNumbers();
    this.editor.setOption('showLineNumbers', showNumbers);
    this.editor.setOption('showGutter', showNumbers);
    this.editor.on('change', this.handleChanges);
    this.editor.on('blur', this.handleBlur);
  }

  ngOnDestroy(): void {
    this.editor?.off('change', this.handleChanges);
    this.editor?.off('blur', this.handleBlur);
    this.editor?.destroy();
  }

  focusOnText(): void {
    this.editor?.focus();
  }

  resize(): void {
    this.editor?.resize();
  }

  clearSelection(): void {
    this.editor?.clearSelection();
  }

  scrollTop(): void {
    this.editor?.navigateFileStart?.();
    this.editor?.scrollToRow?.(0);
  }

  scrollBottom(): void {
    this.editor?.navigateFileEnd?.();
    const lastRow = this.editor?.getCursorPosition?.()?.row ?? 0;
    this.editor?.scrollToRow?.(lastRow);
  }
}
