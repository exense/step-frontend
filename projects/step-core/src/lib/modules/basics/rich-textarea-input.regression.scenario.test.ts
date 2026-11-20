import { Component, inject, SecurityContext, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { StepBasicsModule } from './step-basics.module';

@Component({
  selector: 'step-rich-textarea-input-regression-host',
  imports: [StepBasicsModule, ReactiveFormsModule],
  template: `
    <step-rich-textarea
      ngDefaultControl
      aria-label="Description"
      placeholder="Enter a description"
      [formControl]="control"
      [readonly]="readOnly()"
    />
  `,
})
class RichTextareaInputRegressionHostComponent {
  private readonly _formBuilder = inject(FormBuilder);

  /* eslint-disable step-lint/component-public-fields -- The test host exposes its form and readonly input to the scenarios. */
  readonly control = this._formBuilder.control<string | null>('<b>Alpha</b><i> tail</i>');
  readonly readOnly = signal(false);
  /* eslint-enable step-lint/component-public-fields */
}

describe('SED-4973 rich textarea input regression', () => {
  let fixture: ComponentFixture<RichTextareaInputRegressionHostComponent>;
  let host: RichTextareaInputRegressionHostComponent;

  const textbox = (): HTMLElement => {
    const elements = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="textbox"]');
    expect(elements).toHaveLength(1);
    return elements[0];
  };

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const writeModel = async (value: string | null): Promise<void> => {
    host.control.setValue(value, { emitEvent: false });
    await settle();
  };

  const dispatchInput = async (): Promise<void> => {
    textbox().dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };

  const editedHtml = async (html: string): Promise<void> => {
    textbox().innerHTML = html;
    await dispatchInput();
  };

  const modelContent = (): HTMLDivElement => {
    const content = document.createElement('div');
    content.innerHTML = host.control.value ?? '';
    return content;
  };

  const placeCaret = (node: Node, offset: number): void => {
    const editor = textbox();
    editor.focus();
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const textNode = (text: string): Text => {
    const nodes = document.createTreeWalker(textbox(), NodeFilter.SHOW_TEXT);
    let node = nodes.nextNode();
    while (node && node.textContent !== text) {
      node = nodes.nextNode();
    }
    expect(node).not.toBeNull();
    return node as Text;
  };

  const caretPrefix = (): string => {
    const selection = document.getSelection()!;
    expect(selection.rangeCount).toBe(1);
    const caret = selection.getRangeAt(0);
    expect(caret.collapsed).toBe(true);
    expect(textbox().contains(caret.startContainer)).toBe(true);
    const prefix = document.createRange();
    prefix.selectNodeContents(textbox());
    prefix.setEnd(caret.startContainer, caret.startOffset);
    return prefix.toString();
  };

  // Happy DOM has no native typing: supply the browser's edited DOM and resulting caret.
  const insertAtCaret = async (text: string): Promise<void> => {
    const selection = document.getSelection()!;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const inserted = document.createTextNode(text);
    range.insertNode(inserted);
    range.setStartAfter(inserted);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    await dispatchInput();
  };

  const lineText = (node: Node): string => {
    if (node.nodeName === 'BR') {
      return '\n';
    }
    return node.nodeType === Node.TEXT_NODE
      ? (node.textContent ?? '')
      : Array.from(node.childNodes).map(lineText).join('');
  };

  const expectSanitized = (content: HTMLElement): void => {
    expect(content.querySelector('script, iframe, object')).toBeNull();
    for (const element of Array.from(content.querySelectorAll('*'))) {
      for (const attribute of Array.from(element.attributes)) {
        expect(attribute.name).not.toMatch(/^on/i);
        if (['href', 'src'].includes(attribute.name)) {
          expect(attribute.value).not.toMatch(/^\s*javascript:/i);
        }
      }
    }
    expect(content.querySelector('b, strong')?.textContent).toBe('Safe');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RichTextareaInputRegressionHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(RichTextareaInputRegressionHostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.getSelection()?.removeAllRanges();
    fixture.destroy();
  });

  it('AC-1: continues Unicode insertion in the middle of formatted text without moving the caret', async () => {
    placeCaret(textNode('Alpha'), 2);

    await insertAtCaret('🙂');
    expect(caretPrefix()).toBe('Al🙂');
    await insertAtCaret('界');

    expect(caretPrefix()).toBe('Al🙂界');
    expect(textbox().textContent).toBe('Al🙂界pha tail');
    expect(textbox().querySelector('b, strong')?.textContent).toBe('Al🙂界pha');
    expect(textbox().querySelector('i, em')?.textContent).toBe(' tail');
    expect(modelContent().querySelector('b, strong')?.textContent).toBe('Al🙂界pha');
  });

  it('AC-1: retains the middle insertion position when an edited formatted node requires sanitization', async () => {
    const text = textNode('Alpha');
    const formatted = text.parentElement!;
    formatted.setAttribute('onmouseover', 'unsafe()');
    placeCaret(text, 2);

    await insertAtCaret('🙂');

    expect(textbox().querySelector('[onmouseover]')).toBeNull();
    expect(modelContent().querySelector('[onmouseover]')).toBeNull();
    expect(textbox().querySelector('b, strong')?.textContent).toBe('Al🙂pha');
    expect(caretPrefix()).toBe('Al🙂');
    await insertAtCaret('界');
    expect(caretPrefix()).toBe('Al🙂界');
    expect(textbox().querySelector('b, strong')?.textContent).toBe('Al🙂界pha');
    expect(textbox().querySelector('i, em')?.textContent).toBe(' tail');
  });

  it('AC-2: updates the form value and empty state while typing and deleting the contents', async () => {
    await writeModel('');
    expect(textbox().classList.contains('step-rich-textarea-empty')).toBe(true);
    expect(textbox().getAttribute('data-placeholder')).toBe('Enter a description');

    await editedHtml('a');
    expect(host.control.value).toBe('a');
    expect(textbox().classList.contains('step-rich-textarea-empty')).toBe(false);
    await editedHtml('ab');
    expect(host.control.value).toBe('ab');
    await editedHtml('<br>');
    expect(host.control.value).toBe('');
    expect(textbox().classList.contains('step-rich-textarea-empty')).toBe(true);
  });

  it('AC-2: avoids HTML reparsing beyond sanitization for ordinary typing and deletion', async () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const parse = jest.spyOn(Element.prototype, 'innerHTML', 'set');
    const templateParse = jest.spyOn(HTMLTemplateElement.prototype, 'innerHTML', 'set');
    const parseCount = (): number => parse.mock.calls.length + templateParse.mock.calls.length;
    const clearCounts = (): void => {
      parse.mockClear();
      templateParse.mockClear();
    };
    const measurements: Array<{ value: string; sanitizationParses: number; inputParses: number }> = [];
    for (const value of ['a', 'ab', 'abc', '']) {
      textbox().innerHTML = value;
      clearCounts();
      sanitizer.sanitize(SecurityContext.HTML, value);
      const sanitizationParses = parseCount();
      clearCounts();

      await dispatchInput();

      measurements.push({ value, sanitizationParses, inputParses: parseCount() });
      expect(host.control.value).toBe(value);
    }
    parse.mockRestore();
    templateParse.mockRestore();

    expect(
      measurements.map(({ value, sanitizationParses, inputParses }) => ({
        value,
        redundantParses: Math.max(0, inputParses - sanitizationParses),
      })),
    ).toEqual(measurements.map(({ value }) => ({ value, redundantParses: 0 })));
  });

  it('AC-3: sanitizes external and edited HTML while retaining safe formatting', async () => {
    const unsafe =
      '<b>Safe</b><script>unsafe()</script><img src="x" onerror="unsafe()"><a href="javascript:unsafe()">link</a>';
    await writeModel(unsafe);
    expectSanitized(textbox());
    expect(textbox().textContent).toBe('Safelink');

    await editedHtml(unsafe);
    expectSanitized(textbox());
    expectSanitized(modelContent());
    expect(modelContent().textContent).toBe('Safelink');
    await writeModel(null);
    expect(textbox().textContent).toBe('');
    expect(textbox().classList.contains('step-rich-textarea-empty')).toBe(true);
  });

  it('AC-3: inserts Enter and clipboard plain text at the selected position with formatting and line breaks intact', async () => {
    placeCaret(textNode('Alpha'), 2);
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    textbox().dispatchEvent(enter);
    await settle();

    expect(enter.defaultPrevented).toBe(true);
    expect(lineText(textbox())).toBe('Al\npha tail');
    expect(caretPrefix()).toBe('Al');

    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: {
        getData: (format: string): string =>
          format === 'text/plain' ? '<b>literal</b>\r\n界' : '<b>HTML clipboard must not be used</b>',
      },
    });
    textbox().dispatchEvent(paste);
    await settle();

    expect(paste.defaultPrevented).toBe(true);
    expect(lineText(textbox())).toBe('Al\n<b>literal</b>\n界pha tail');
    expect(lineText(modelContent())).toBe('Al\n<b>literal</b>\n界pha tail');
    expect(textbox().querySelectorAll('b, strong')).toHaveLength(1);
    expect(textbox().querySelector('i, em')?.textContent).toBe(' tail');
  });

  it('AC-3: defers composition updates until completion and emits the committed value once', async () => {
    await writeModel('');
    const changes: Array<string | null> = [];
    const textValue = (html: string | null): string => {
      const content = document.createElement('div');
      content.innerHTML = html ?? '';
      return content.textContent ?? '';
    };
    const subscription = host.control.valueChanges.subscribe((value) => changes.push(value));
    try {
      textbox().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      await editedHtml('に');
      await editedHtml('日本');
      expect(changes).toEqual([]);
      expect(host.control.value).toBe('');

      const enter = new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, cancelable: true });
      textbox().dispatchEvent(enter);
      expect(enter.defaultPrevented).toBe(false);
      textbox().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '日本' }));
      await settle();
      await dispatchInput();
      expect(changes.map(textValue)).toEqual(['日本']);
      expect(textbox().textContent).toBe('日本');

      await editedHtml('日本語');
      expect(changes.map(textValue)).toEqual(['日本', '日本語']);
    } finally {
      subscription.unsubscribe();
    }
  });

  it('AC-3: restores displayed content and prevents form updates during readonly and disabled interactions', async () => {
    for (const state of ['readonly', 'disabled']) {
      host.readOnly.set(state === 'readonly');
      if (state === 'disabled') {
        host.control.disable({ emitEvent: false });
      }
      await settle();
      expect(textbox().isContentEditable).toBe(false);
      expect(textbox().getAttribute(`aria-${state}`)).toBe('true');
      await editedHtml('attempted edit');
      expect(host.control.value).toBe('<b>Alpha</b><i> tail</i>');
      expect(textbox().textContent).toBe('Alpha tail');

      placeCaret(textNode('Alpha'), 2);
      textbox().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
      const beforeInput = new InputEvent('beforeinput', { inputType: 'insertText', cancelable: true });
      textbox().dispatchEvent(beforeInput);
      await settle();
      expect(beforeInput.defaultPrevented).toBe(true);
      expect(textbox().textContent).toBe('Alpha tail');
      expect(host.control.value).toBe('<b>Alpha</b><i> tail</i>');
    }

    host.control.enable({ emitEvent: false });
    await settle();
    expect(textbox().isContentEditable).toBe(true);
    await editedHtml('editable again');
    expect(host.control.value).toBe('editable again');
  });
});
