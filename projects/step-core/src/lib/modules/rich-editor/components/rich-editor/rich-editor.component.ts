import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  forwardRef,
  input,
  OnDestroy,
  output,
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
import { debounceTime, map, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type OnChange = (value?: string) => void;
type OnTouch = () => void;

export interface RichEditorVerticalScroll {
  firstRow: number;
  lastRow: number;
}

@Component({
  selector: 'step-rich-editor',
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
  readonly fontSize = input(12);
  readonly firstLineNumber = input(1);
  readonly verticalScroll = output<RichEditorVerticalScroll>();

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private editorElement = viewChild('editor', { read: ElementRef<HTMLDivElement> });
  private editor?: ace.Ace.Editor;
  private scrollTopChange$ = new Subject<number>();
  private scrollTopChangeSubscription = this.scrollTopChange$
    .pipe(
      debounceTime(300),
      map(() => {
        const firstLineNumber = this.firstLineNumber();
        const firstRow = firstLineNumber + (this.editor?.getFirstVisibleRow?.() ?? 0);
        const lastRow = firstLineNumber + (this.editor?.getLastVisibleRow?.() ?? 0);
        return { firstRow, lastRow } as RichEditorVerticalScroll;
      }),
      takeUntilDestroyed(),
    )
    .subscribe((event) => this.verticalScroll.emit(event));

  private initialValue: string = '';

  protected readonly isDisabled = signal(false);

  private handleChanges = () => this.onChange?.(this.editor?.getValue() ?? '');
  private handleBlur = () => this.onTouch?.();
  private handleScrollTopChange = (scrollTop: number) => this.scrollTopChange$.next(scrollTop);

  private effectSyntaxModeChange = effect(() => {
    const syntaxMode = this.syntaxMode() ?? '';
    this.editor?.session?.setMode?.(syntaxMode);
  });
  private effectWrapTextChange = effect(() => {
    const wrapText = this.wrapText();
    this.editor?.setOption?.('wrap', wrapText);
  });
  private effectRowNumbersChange = effect(() => {
    const showNumbers = this.rowNumbers();
    this.editor?.setOption?.('showLineNumbers', showNumbers);
    this.editor?.setOption?.('showGutter', showNumbers);
  });
  private effectFirstLineNumberChange = effect(() => {
    const firstLineNumber = this.firstLineNumber();
    this.editor?.setOption?.('firstLineNumber', firstLineNumber);
  });
  private effectFontSizeChange = effect(() => {
    const fontSize = this.fontSize();
    this.editor?.setOption?.('fontSize', fontSize);
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
    const firstLineNumber = this.firstLineNumber();
    this.editor.setOption('firstLineNumber', firstLineNumber);
    this.editor.setOption('fontSize', this.fontSize());
    this.editor.on('change', this.handleChanges);
    this.editor.on('blur', this.handleBlur);
    this.editor.session.on('changeScrollTop', this.handleScrollTopChange);
  }

  ngOnDestroy(): void {
    this.editor?.off('change', this.handleChanges);
    this.editor?.off('blur', this.handleBlur);
    this.editor?.session?.off?.('changeScrollTop', this.handleScrollTopChange);
    this.editor?.destroy();
    this.scrollTopChange$.complete();
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

  scrollToRowUpEdge(row: number): void {
    this.editor?.scrollToRow?.(row);
  }

  scrollToRowBottomEdge(row: number): void {
    const firstVisibleRow = this.editor?.getFirstVisibleRow?.() ?? 0;
    const lastVisibleRow = this.editor?.getLastVisibleRow?.() ?? 0;
    const displayedLines = lastVisibleRow - firstVisibleRow - 1;
    this.editor?.scrollToRow?.(row - displayedLines);
  }
}
