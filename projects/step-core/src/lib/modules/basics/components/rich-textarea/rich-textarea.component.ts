import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  SecurityContext,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'step-rich-textarea',
  template: '',
  styleUrl: './rich-textarea.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextareaComponent), multi: true }],
  host: {
    role: 'textbox',
    'aria-multiline': 'true',
    '[attr.contenteditable]': 'editable()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.aria-readonly]': 'readOnly()',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[attr.data-placeholder]': 'placeholder()',
    '[class.step-rich-textarea-empty]': 'empty()',
    '[style.--style__rows]': 'visibleRows()',
    '(input)': 'handleInput()',
    '(blur)': 'handleBlur()',
    '(compositionstart)': 'handleCompositionStart()',
    '(compositionend)': 'handleCompositionEnd()',
    '(keydown)': 'handleKeydown($event)',
    '(beforeinput)': 'handleBeforeInput($event)',
    '(paste)': 'handlePaste($event)',
  },
})
export class RichTextareaComponent implements ControlValueAccessor {
  readonly placeholder = input('');
  readonly rows = input(2, { transform: numberAttribute });
  readonly readOnly = input(false, { alias: 'readonly', transform: booleanAttribute });

  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _sanitizer = inject(DomSanitizer);
  protected readonly disabled = signal(false);
  protected readonly empty = signal(true);
  protected readonly editable = computed(() => {
    const disabled = this.disabled();
    const readOnly = this.readOnly();
    return !disabled && !readOnly;
  });
  protected readonly visibleRows = computed(() => {
    const rows = this.rows();
    return Number.isFinite(rows) && rows > 0 ? Math.max(1, Math.floor(rows)) : 2;
  });

  private value = '';
  private composing = false;
  private compositionValue: string | undefined;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | undefined): void {
    this.compositionValue = undefined;
    this.value = this.sanitize(value ?? '');
    this.render(this.value);
  }

  registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected handleInput(): void {
    if (!this.editable()) {
      this.render(this.value);
      return;
    }
    if (this.composing) {
      return;
    }
    const html = this.sanitize(this._element.nativeElement.innerHTML);
    const value = this.isEmpty(html) ? '' : html;
    this.render(value);
    const duplicateCompositionInput = value === this.compositionValue;
    this.compositionValue = undefined;
    if (duplicateCompositionInput) {
      return;
    }
    this.value = value;
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected handleCompositionStart(): void {
    this.composing = this.editable();
  }

  protected handleCompositionEnd(): void {
    this.composing = false;
    this.handleInput();
    this.compositionValue = this.value;
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && ['b', 'i', 'u'].includes(event.key.toLowerCase())) {
      event.preventDefault();
    } else if (event.key === 'Enter' && !event.isComposing && !this.composing) {
      event.preventDefault();
      if (this.editable()) {
        this.insertText('\n');
      }
    }
  }

  protected handleBeforeInput(event: InputEvent): void {
    if (!this.editable() || /^format(Bold|Italic|Underline)$/i.test(event.inputType)) {
      event.preventDefault();
    } else if (!this.composing && ['insertParagraph', 'insertLineBreak'].includes(event.inputType)) {
      event.preventDefault();
      this.insertText('\n');
    }
  }

  protected handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (this.editable() && event.clipboardData) {
      this.insertText(event.clipboardData.getData('text/plain'));
    }
  }

  private insertText(text: string): void {
    if (!this.editable() || !text) {
      return;
    }
    const element = this._element.nativeElement;
    const document = element.ownerDocument;
    const selection = document.getSelection();
    if (!selection) {
      return;
    }
    let range = selection.rangeCount ? selection.getRangeAt(0) : undefined;
    if (!range || !element.contains(range.commonAncestorContainer)) {
      if (document.activeElement !== element) {
        return;
      }
      range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
    }
    const fragment = document.createDocumentFragment();
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    lines.forEach((line, index) => {
      if (index) {
        fragment.append(document.createElement('br'));
      }
      if (line) {
        fragment.append(document.createTextNode(line));
      }
    });
    const last = fragment.lastChild!;
    range.deleteContents();
    range.insertNode(fragment);
    range.setStartAfter(last);
    range.collapse(true);
    if (last.nodeName === 'BR') {
      const tail = document.createRange();
      tail.selectNodeContents(element);
      tail.setStartAfter(last);
      const remainder = tail.cloneContents();
      if (!remainder.textContent && !remainder.querySelector('br, img, video, audio, hr, table')) {
        last.parentNode!.insertBefore(document.createElement('br'), last.nextSibling);
      }
    }
    selection.removeAllRanges();
    selection.addRange(range);
    this.handleInput();
  }

  private sanitize(html: string): string {
    return this._sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }

  private isEmpty(html: string): boolean {
    const container = this._element.nativeElement.ownerDocument.createElement('div');
    container.innerHTML = html;
    if (container.textContent || container.querySelector('img, video, audio, hr, table')) {
      return false;
    }
    return container.querySelectorAll('br').length < 2;
  }

  private render(html: string): void {
    const element = this._element.nativeElement;
    this.empty.set(this.isEmpty(html));
    const normalized = element.ownerDocument.createElement('div');
    normalized.innerHTML = html;
    if (element.innerHTML === normalized.innerHTML) {
      return;
    }
    const selection = element.ownerDocument.getSelection();
    const ownedSelection = !!selection?.rangeCount && element.contains(selection.getRangeAt(0).commonAncestorContainer);
    element.innerHTML = html;
    if (ownedSelection) {
      const range = element.ownerDocument.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection!.removeAllRanges();
      selection!.addRange(range);
    }
  }
}
