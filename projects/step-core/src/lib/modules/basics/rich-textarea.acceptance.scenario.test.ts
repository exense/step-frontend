import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StepBasicsModule } from './step-basics.module';

@Component({
  selector: 'step-rich-textarea-acceptance-host',
  imports: [StepBasicsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (wrapped()) {
      <step-form-field data-testid="description-field">
        <step-label>Description</step-label>
        <step-rich-textarea
          ngDefaultControl
          aria-label="Description"
          [formControl]="control"
          [placeholder]="placeholder()"
          [rows]="rows()"
          [readonly]="readOnly()"
        />
        <step-hint>Describe this item</step-hint>
        @if (control.invalid && control.touched) {
          <step-error>Description is required</step-error>
        }
      </step-form-field>
    } @else {
      <step-rich-textarea
        ngDefaultControl
        aria-label="Description"
        [formControl]="control"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [readonly]="readOnly()"
      />
    }
  `,
})
class RichTextareaAcceptanceHostComponent {
  private readonly _formBuilder = inject(FormBuilder);

  /* eslint-disable step-lint/component-public-fields -- Acceptance tests drive this host's public form and inputs. */
  readonly control = this._formBuilder.control<string | null>('test <b>bold</b>');
  readonly wrapped = signal(false);
  readonly placeholder = signal('Enter a description');
  readonly rows = signal(3);
  readonly readOnly = signal(false);
  /* eslint-enable step-lint/component-public-fields */
}

describe('SED-4973 rich textarea acceptance', () => {
  let fixture: ComponentFixture<RichTextareaAcceptanceHostComponent>;
  let host: RichTextareaAcceptanceHostComponent;

  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const textbox = (): HTMLElement => {
    const textboxes = root().querySelectorAll<HTMLElement>('[role="textbox"]');
    expect(textboxes).toHaveLength(1);
    return textboxes[0];
  };

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const writeModel = async (html: string | null): Promise<void> => {
    host.control.setValue(html, { emitEvent: false });
    await settle();
  };

  // This supplies the DOM result of editing; browser-native editing is checked separately.
  const editedHtml = async (html: string): Promise<void> => {
    const editor = textbox();
    editor.innerHTML = html;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };

  const htmlDocument = (html: string | null): HTMLDivElement => {
    expect(typeof html).toBe('string');
    const result = document.createElement('div');
    result.innerHTML = html ?? '';
    return result;
  };

  const expectBoldText = (element: HTMLElement, expected: string): void => {
    const boldText = Array.from(element.querySelectorAll('b, strong')).map((bold) => bold.textContent);
    expect(boldText).toContain(expected);
  };

  const expectSafeHtml = (element: HTMLElement): void => {
    expect(element.querySelector('script, iframe, object')).toBeNull();
    for (const child of Array.from(element.querySelectorAll('*'))) {
      for (const attribute of Array.from(child.attributes)) {
        expect(attribute.name).not.toMatch(/^on/i);
        if (['href', 'src'].includes(attribute.name)) {
          expect(attribute.value).not.toMatch(/^\s*javascript:/i);
        }
      }
    }
    expectBoldText(element, 'Safe');
  };

  const lines = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? '';
    }
    if (node instanceof HTMLElement && node.tagName === 'BR') {
      return '\n';
    }
    const children = Array.from(node.childNodes).map(lines).join('');
    return node instanceof HTMLElement && ['DIV', 'P'].includes(node.tagName) ? `${children}\n` : children;
  };

  const accessibleName = (element: HTMLElement): string => {
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      return labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .join(' ');
    }
    const explicitLabel = element.getAttribute('aria-label');
    if (explicitLabel) {
      return explicitLabel;
    }
    return Array.from(root().querySelectorAll('label'))
      .filter((label) => (!!element.id && label.htmlFor === element.id) || label.contains(element))
      .map((label) => label.textContent?.trim() ?? '')
      .join(' ');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RichTextareaAcceptanceHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(RichTextareaAcceptanceHostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => fixture.destroy());

  it('AC-1: renders HTML in one editable, accessible multiline textbox without a toolbar', () => {
    const editor = textbox();
    expect(editor.textContent).toBe('test bold');
    expectBoldText(editor, 'bold');
    expect(editor.isContentEditable).toBe(true);
    expect(editor.getAttribute('aria-multiline')).toBe('true');
    expect(accessibleName(editor)).toBe('Description');
    expect(root().querySelector('[role="toolbar"]')).toBeNull();
    expect(root().querySelector('button, [role="button"]')).toBeNull();
  });

  it('AC-2: propagates edited HTML and preserves the formatting present after insertion and deletion', async () => {
    textbox();
    await editedHtml('test <b>bold!</b> and <i>italic</i>');
    let model = htmlDocument(host.control.value);
    expect(model.textContent).toBe('test bold! and italic');
    expectBoldText(model, 'bold!');
    expect(model.querySelector('i, em')?.textContent).toBe('italic');

    await editedHtml('test <b>bold</b> and <i>italic</i>');
    model = htmlDocument(host.control.value);
    expect(model.textContent).toBe('test bold and italic');
    expectBoldText(model, 'bold');
    expect(model.querySelector('i, em')?.textContent).toBe('italic');
  });

  it('AC-3: preserves edited line breaks when the emitted HTML is written back', async () => {
    textbox();
    await editedHtml('<b>first</b><br>second<br>third');
    const emitted = host.control.value;
    expect(lines(htmlDocument(emitted)).trimEnd()).toBe('first\nsecond\nthird');

    await writeModel('temporary');
    await writeModel(emitted);
    expect(lines(textbox()).trimEnd()).toBe('first\nsecond\nthird');
    expectBoldText(textbox(), 'first');
  });

  it('AC-4: removes unsafe incoming and outgoing HTML while retaining safe formatting', async () => {
    textbox();
    const unsafe = '<b>Safe</b><script>bad()</script><img src="x" onerror="bad()"><a href="javascript:bad()">link</a>';
    await writeModel(unsafe);
    expectSafeHtml(textbox());
    expect(textbox().textContent).toBe('Safelink');

    await editedHtml(unsafe);
    const model = htmlDocument(host.control.value);
    expectSafeHtml(model);
    expect(model.textContent).toBe('Safelink');
  });

  it('AC-5: displays null and empty values as empty and emits an empty string when cleared', async () => {
    textbox();
    await writeModel(null);
    expect(textbox().textContent).toBe('');
    await writeModel('');
    expect(textbox().textContent).toBe('');
    await writeModel('<b>populated</b>');
    expect(textbox().textContent).toBe('populated');
    await editedHtml('');
    expect(host.control.value).toBe('');
    expect(textbox().textContent).toBe('');
  });

  it('AC-6: supports external writes, edit notifications, touched-on-blur, and disabled forms state', async () => {
    textbox();
    const changes: Array<string | null> = [];
    const subscription = host.control.valueChanges.subscribe((value) => changes.push(value));
    try {
      await writeModel('<b>external</b>');
      expect(textbox().textContent).toBe('external');
      expectBoldText(textbox(), 'external');
      expect(changes).toEqual([]);
      expect(host.control.pristine).toBe(true);
      expect(host.control.untouched).toBe(true);

      host.control.setValue('<b>another write</b>');
      await settle();
      expect(changes).toEqual(['<b>another write</b>']);
      changes.length = 0;
      await editedHtml('<b>edited</b>');
      expect(changes).toHaveLength(1);
      expect(htmlDocument(changes[0]).textContent).toBe('edited');
      expect(host.control.dirty).toBe(true);
      expect(host.control.untouched).toBe(true);

      textbox().dispatchEvent(new FocusEvent('blur'));
      await settle();
      expect(host.control.touched).toBe(true);

      host.control.disable({ emitEvent: false });
      await settle();
      expect(textbox().isContentEditable).toBe(false);
      expect(textbox().getAttribute('aria-disabled')).toBe('true');
      const disabledValue = host.control.value;
      await editedHtml('attempted disabled edit');
      expect(host.control.value).toBe(disabledValue);
      expect(changes).toHaveLength(1);

      host.control.enable({ emitEvent: false });
      await settle();
      expect(textbox().isContentEditable).toBe(true);
      await editedHtml('enabled edit');
      expect(host.control.value).toBe('enabled edit');
    } finally {
      subscription.unsubscribe();
    }
  });

  it('AC-7: exposes read-only content without allowing edits to update the model', async () => {
    textbox();
    host.readOnly.set(true);
    await settle();
    expect(textbox().textContent).toBe('test bold');
    expect(textbox().isContentEditable).toBe(false);
    expect(textbox().getAttribute('aria-readonly')).toBe('true');
    expect(textbox().getAttribute('aria-disabled')).not.toBe('true');
    await editedHtml('attempted read-only edit');
    expect(host.control.value).toBe('test <b>bold</b>');

    host.readOnly.set(false);
    await settle();
    expect(textbox().isContentEditable).toBe(true);
    await editedHtml('editable again');
    expect(host.control.value).toBe('editable again');
  });

  it('AC-8: works inside an external form field with its label, hint, and validation states', async () => {
    textbox();
    host.control.addValidators(Validators.required);
    await writeModel('');
    host.wrapped.set(true);
    await settle();

    const editor = textbox();
    const field = root().querySelector<HTMLElement>('[data-testid="description-field"]');
    expect(field).not.toBeNull();
    expect(accessibleName(editor)).toBe('Description');
    expect(field!.textContent).toContain('Describe this item');
    expect(field!.classList.contains('ng-invalid')).toBe(true);
    expect(field!.classList.contains('ng-touched')).toBe(false);
    expect(field!.textContent).not.toContain('Description is required');

    editor.dispatchEvent(new FocusEvent('blur'));
    await settle();
    expect(field!.classList.contains('ng-touched')).toBe(true);
    expect(field!.textContent).toContain('Description is required');

    await editedHtml('valid description');
    expect(field!.classList.contains('ng-invalid')).toBe(false);
    expect(field!.classList.contains('ng-touched')).toBe(true);
    expect(field!.textContent).not.toContain('Description is required');
  });
});
